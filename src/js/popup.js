/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-09-16
 */

$(function() {
	"use strict";
	
	var projectManager = new ProjectManager();
	var taskManager = new TaskManager();
	var projectList = new Array();
	var showType = "today";
	var showProject;
	
	function main() {
		initProjectEvents();
		initTaskEvents();
		initProjects();
		initTasks();
	}
	
	function initProjectEvents() {
		var type = "add";
		var projectId = 0;
		var $showProjects = $("#showProjects");
		var $project_input = $(".project_input");
		var $project_add = $(".project_add");
		var $projectName = $("input[name='projectName']");
		
		var showProject = function(flag) {
			var $menu = $(".project_menu");
			flag = typeof flag == "boolean" ? flag : $menu.is(":hidden");
			if (flag) {
				$showProjects.text("隐藏项目");
				$menu.show();
			} else {
				$showProjects.text("显示项目");
				$menu.hide();
			}
		};
		var addProject = function() {
			type = "add";
			$("li[data-index]>a").show();
			$projectName.val("");
			$project_input.appendTo($project_add).show();
		};
		var editProject = function(e) {
			e.stopPropagation();
			type = "update";
			$("li[data-index]>a").show();
			var $li = $(this).parents("li[data-index]");
			projectId = $li.attr("data-index");
			$projectName.val(projectList[$li.index()].name);
			$project_input.appendTo($li).show();
			$(">a", $li).hide();
		};
		var removeProject = function(e) {
			e.stopPropagation();
			var $li = $(this).parents("li[data-index]");
			var id = $li.attr("data-index");
			bootbox.confirm("确定删除该项目：" + projectList[$li.index()].name + "？", function(flag) {
				if (!flag) return;
				projectManager.deleteProject(id, function(result) {
					if (result) {
						initProjects();
					} else {
						
					}
				});
			});
		};
		var projectOk = function() {
			var projectName = $.trim($projectName.val());
			if (projectName) {
				var func = type + "Project";
				var project = {name: projectName};
				if (type == "update") {
					project.id = projectId;
				}
				projectManager[func](project, function(result) {
					if (result) {
						initProjects();
						projectCancle();
					} else {
						
					}
				});
			} else {
				$projectName.focus();
			}
		};
		var projectCancle = function() {
			$("input", $project_input).val("");
			$("li[data-index]>a").show();
			$project_input.hide();
		};
		var showList = function() {
			var type = $(this).attr("data-type");
			var project;
			if (type == "project") {
				project = projectList[$(this).parent().index()];
			}
			showProject(false);
			showTasks($(this).attr("data-type"), project);
		};
		
		//events
		$showProjects.click(showProject);
		$(document).on("click", "#addProject", addProject);
		$(document).on("click", ".project_edit", editProject);
		$(document).on("click", ".project_remove", removeProject);
		$(document).on("click", "#projectOk", projectOk);
		$(document).on("click", "#projectCancel", projectCancle);
		$(document).on("keydown", "input[name='projectName']", function(e) {
			if (e.keyCode == 13) projectOk();
		});
		$(document).on("click", ".show_project_list", showList);
	}
	
	function initTaskEvents() {
		var addTask = function() {
			if (projectList.length == 0) {
				bootbox.alert("您还未添加项目！");
				return;
			}
			var addOk = function() {
				var task = new Object();
				task.project_id = $(".input_select").val();
				task.date = $(".input_date").val();
				task.title = $.trim($("input[name='taskTitle']").val());
				if (!task.title) {
					$("input[name='taskTitle']").focus();
					return false;
				}
				taskManager.addTask(task, function(result) {
					if (result) {
						initProjects();
					}
					else {
						bootbox.alert("添加失败！");
					}
				});
			};
			bootbox.confirm(template.task.addItem(projectList), "添加任务", function(flag) {
				if (!flag) return;
				addOk();
			});
			$(".datepicker").remove();
			$(".input_datepicker").datepicker({
				date: new Date(),
				format: "yyyy-mm-dd"
			}).on('changeDate', function(date) {
				$(".input_datepicker").datepicker('hide');
			});
			$("input[name='taskTitle']").keyup(function(e) {
				if (e.keyCode == 13) {
					addOk(true);
					$("input[name='taskTitle']").val("");
				}
			});
		};
		var updateStatus = function() {
			var id = $(this).val();
			var status = $(this).attr("checked") ? taskManager.COMPLETED : taskManager.TODO;
			taskManager.updateTaskStatus(id, status, function() {
				initProjects();
				initTasks();
			});
		};
		var getTaskId = function(target) {
			var $li = $(target).parents("li.form-inline");
			var id = $("input[name='taskStatus']", $li).val();
			return id;
		}
		var deferTask = function(e) {
			e.stopPropagation();
			taskManager.deferTask(getTaskId(this), function() {
				initProjects();
			});
		};
		var editTask = function(e) {
			e.stopPropagation();
			taskManager.getTask(getTaskId(this), function(task) {
				var updateOk = function() {
					task.project_id = $(".input_select").val();
					task.date = $(".input_date").val();
					task.title = $.trim($("input[name='taskTitle']").val());
					if (!task.title) {
						$("input[name='taskTitle']").focus();
						return false;
					}
					taskManager.updateTask(task, function(result) {
						if (result) {
							initProjects();
						}
						else {
							bootbox.alert("修改失败！");
						}
					});
				}
				bootbox.confirm(template.task.addItem(projectList), "修改任务", function(flag) {
					if (!flag) return;
					updateOk();
				});
				$(".input_select").val(task.project_id);
				$(".datepicker").remove();
				$(".input_datepicker").datepicker({
					date: new Date(task.date),
					format: "yyyy-mm-dd"
				}).on('changeDate', function(date) {
					$(".input_datepicker").datepicker('hide');
				});
				$("input[name='taskTitle']").val(task.title);
			});
		};
		var removeTask = function(e) {
			e.stopPropagation();
			var id = getTaskId(this);
			bootbox.confirm("确定删除该任务？", function(flag) {
				if (!flag) return;
				taskManager.deleteTask(id, function(result) {
					if (result) {
						initProjects();
						initTasks();
					} else {
						
					}
				});
			});
		};
		
		$("#addTask").click(addTask);
		$(document).on("change", "input[name='taskStatus']", updateStatus);
		$(document).on("click", ".task_defer", deferTask);
		$(document).on("click", ".task_edit", editTask);
		$(document).on("click", ".task_remove", removeTask);
	}
	
	function initProjects() {
		var $projectToday = $(".project_menu .project_today");
		var $projectAll = $(".project_menu .project_all");
		var $projectNav = $(".project_menu .nav");
		taskManager.getTodayTasks(function(tasks) {
			$projectToday.text(tasks.length);
		});
		taskManager.getAllTasks(function(tasks) {
			$projectAll.text(tasks.length);
		});
		projectManager.getProjects(function(projects) {
			var html = "";
			projectList = projects;
			if (projects) {
				$.each(projects, function(i, project) {
					html += template.project.listItem({
						id: project.id,
						count: project.count,
						name: project.name
					});
				});
			}
			$projectNav.html(html);
			$(".dropdown", $projectNav).append(template.project.menu);
			showTasks(showType, showProject);
		});
	}
	
	function initTasks() {
		taskManager.getExpiredTasks(function(tasks) {
			var count = 0;
			if (tasks) {
				count += tasks.length;
			}
			taskManager.getTodayTasks(function(tasks) {
				if (tasks) {
					count += tasks.length;
				}
				try {
					chrome.browserAction.setBadgeText({text: count > 0 ? count + "" : ""});
				} catch(e) {
					
				}
			});
		});
		taskManager.getCompletedTasks(function(tasks) {
			$("#completedLink span").text(tasks.length);
		});
	}
	
	function showTasks(type, project) {
		showType = type;
		showProject = project;
		var $listview = $(".content .nav");
		switch (type) {
		case "today":
			taskManager.getExpiredTasks(function(tasks) {
				var html = "";
				if (tasks.length > 0) {
					html += template.task.list({
						title: "过期", 
						list: getTasksLabel("project", tasks),
						labelCls: "important"
					});
				}
				taskManager.getTodayTasks(function(tasks) {
					html += template.task.list({
						title: "今天", 
						list: getTasksLabel("project", tasks)
					});
					$listview.html(html);
				});
			});
			break;
		case "all":
			taskManager.getAllTasks(function(tasks) {
				$listview.html(template.task.list({
					title: "所有", 
					list: getTasksLabel("project", tasks)
				}));
			});
			break;
		case "project":
			taskManager.getProjectTasks(project.id, function(tasks) {
				$listview.html(template.task.list({
					title: project.name, 
					list: getTasksLabel("date", tasks)
				}));
			});
			break;
		case "completed":
			taskManager.getCompletedTasks(function(tasks) {
				$listview.html(template.task.list({
					title: "已完成", 
					list: getTasksLabel("date", tasks)
				}));
				$("label.checkbox", $listview).addClass("lth");
			});
			break;
			break;
		default:
			break;
		}
		//fix menu position
		$(".taskmenu").unbind("click").bind("click", function (e) {
			if (e.pageY > 320) {
				$(this).next().css("margin-top", "-110px");
			} else {
				$(this).next().css("margin-top", "2px");
			}
		});
	}
	
	function getTasksLabel(type, tasks) {
		var results = new Array();
		for (var i = 0; i < tasks.length; i++) {
			var task = tasks[i];
			if (type == "project") {
				task.label = getProjectLabel(task.project_id);
			} else if (type == "date") {
				task.label = getDateLabel(task.date);
			}
			results.push(task);
		}
		return results;
	}
	
	function getProjectLabel(id) {
		for (var i = 0; i < projectList.length; i++) {
			if (projectList[i].id == id) {
				return projectList[i].name;
			}
		}
		return;
	}
	
	function getDateLabel(date) {
		return date;
	}
	
	main();
});