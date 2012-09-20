/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-09-12
 */

;(function(window) {
	"use strict";
	
	var PROJECT = "project",
		TASK = "task";
	
	var lib = new LocalStorageDB("todolist");
	createTables();
	
	var taskManager = new TaskManager();
	
	function createTables() {
		if (!lib.tableExists(PROJECT)) {
			lib.createTable(PROJECT, ["name"]);
		}
		if (!lib.tableExists(TASK)) {
			lib.createTable(TASK, ["status", "title", "date", "project_id"]);
		}
	}
	
	function ProjectManager() {
		return {
			addProject: function(project, callback) {
				lib.insert(PROJECT, project);
				lib.commit();
				callback(true);
			},
			
			deleteProject: function(id, callback) {
				lib.deleteRows(PROJECT, {id: id});
				lib.commit();
				taskManager.deleteTasks(id, function(){});
				callback(true);
			},
			
			updateProject: function(project, callback) {
				lib.update(PROJECT, {id: project.id}, function(row) {
					row.name = project.name;
					return row;
				});
				lib.commit();
				callback(true);
			},
			
			getProjects: function(callback) {
				var rows = lib.query(PROJECT);
				var getTasksCount = function(rows, project, completed) {
					taskManager.getProjectTasks(project.id, function(results) {
						project.count = results.length;
						if (completed) {
							callback(rows);
						}
					});
				};
				for (var i = 0; i < rows.length; i++) {
					var project = rows[i];
					getTasksCount(rows, project, i == rows.length - 1);
				}
			},
			
			getProject: function(id, callback) {
				var result = lib.query(PROJECT, {id: id});
				if (result.length) {
					callback(result[0]);
				} else {
					callback(null);
				}
			}
		}
	}
	
	function TaskManager() {
		return {
			TODO: "todo",
			COMPLETED: "completed",
			
			addTask: function(task, callback) {
				task.status =  this.TODO;
				task.date = task.date;
				lib.insert(TASK, task);
				lib.commit();
				callback(true);
			},
			
			deleteTask: function(id, callback) {
				lib.deleteRows(TASK, {id: id});
				lib.commit();
				callback(true);
			},
			
			deleteTasks: function(project_id, callback) {
				lib.deleteRows(TASK, {project_id: project_id});
				lib.commit();
				callback(true);
			},
			
			updateTask: function(task, callback) {
				lib.update(TASK, {id: task.id}, function(row) {
					row.title = task.title;
					row.date = task.date;
					return row;
				});
				lib.commit();
				callback(true);
			},
			
			updateTaskStatus: function(id, status, callback) {
				lib.update(TASK, {id: id}, function(row) {
					row.status = status;
					return row;
				});
				lib.commit();
				callback(true);
			},
			
			deferTask: function(id, callback) {
				lib.update(TASK, {id: id}, function(row) {
					var date = parseDate(row.date);
					date.setDate(date.getDate() + 1);
					row.date = dateToString(date);
					return row;
				});
				lib.commit();
				callback(true);
			},
			
			moveTask: function(id, project_id, callback) {
				lib.update(TASK, {id: id}, function(row) {
					row.project_id = project_id;
					return row;
				});
				lib.commit();
				callback(true);
			},
			
			getTodayTasks: function(callback) {
				var that = this;
				var result = lib.query(TASK, function(row) {
					return row.status == that.TODO && row.date == dateToString(new Date());
				});
				if (result) {
					callback(result);
				} else {
					callback([]);
				}
			},
			
			getExpiredTasks: function(callback) {
				var that = this;
				var result = lib.query(TASK, function(row) {
					return row.status == that.TODO && row.date < dateToString(new Date());
				});
				if (result) {
					callback(result);
				} else {
					callback([]);
				}
			},
			
			getAllTasks: function(callback) {
				var result = lib.query(TASK, {status: this.TODO});
				if (result) {
					callback(result);
				} else {
					callback([]);
				}
			},
			
			getProjectTasks: function(project_id, callback) {
				var that = this;
				var result = lib.query(TASK, function(row) {
					return row.status == that.TODO && row.project_id == project_id;
				});
				if (result) {
					callback(result);
				} else {
					callback([]);
				}
			},
			
			getCompletedTasks: function(callback) {
				var result = lib.query(TASK, {status: this.COMPLETED});
				if (result) {
					callback(result);
				} else {
					callback([]);
				}
			}
		};
	}
	
	/**
	 * Date to yyyy-MM-dd
	 */
	function dateToString(date) {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
	}
	
	/**
	 * yyyy-MM-dd to Date
	 */
	function parseDate(str) {
		var arr = str.split("-");
		var y = parseInt(arr[0], 10);
		var m = parseInt(arr[1], 10) - 1;
		var d = parseInt(arr[2], 10);
		return new Date(y, m, d);
	}
	
	//public properties
	window.ProjectManager = ProjectManager;
	window.TaskManager = TaskManager;
	
})(window);