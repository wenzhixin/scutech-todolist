/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-09-16
 */

;(function(window) {
	"use strict";
	
	window.template = {
		project: {
			listItem: function(obj) {
				return "" +
					"<li data-index='" + obj.id + "'>" +
						"<a href='#' class='show_project_list' data-type='project'>" +
							"<span class='count_color'>" + obj.count + "</span>" +
							obj.name +
							"<div class='dropdown fr'>" +
								"<i class='icon-cog' data-toggle='dropdown'></i>" +
							"</div>" +
						"</a>" +
					"</li>";
			},
			menu: function() {
				return "" +
					"<ul class='dropdown-menu' role='menu'>" +
						"<li>" +
							"<a class='project_edit' href='#'>" +
								"<i class='icon-edit'></i>编辑" +
							"</a>" +
						"</li>" + 
						"<li>" +
							"<a class='project_remove' href='#'>" +
								"<i class='icon-remove'></i>删除" +
							"</a>" +
						"</li>" + 
					"</ul>";
			}
		},
		task: {
			list: function(obj) {
				var header = "<li class='nav-header'>" + obj.title + "</li>";
				var list = "";
				for (var i = 0; i < obj.list.length; i++) {
					var task = obj.list[i];
					list +=	"<li class='form-inline'>" +
								"<input name='taskStatus' type='checkbox' value='" + task.id + "'" + 
								(task.status == "completed" ? " checked='checked'" : "") + " />" + 
								"<label class='checkbox ml5'>" +
									task.title +
								"</label>" +
								"<div class='dropdown fr'>" +
									"<i class='taskmenu icon-cog ml5 fr' data-toggle='dropdown'></i>" +
									this.menu() +
									"<span" + (task.label ? " class='label" + 
											(obj.labelCls ? " badge-" + obj.labelCls : "") + "'>" + 
											task.label : ">" + task.label) + 
									"</span>" +
								"</div>" +
							"</li>";
				}
				return header + list;
			},
			
			addItem: function(list) {
				var options = "";
				for (var i = 0; i < list.length; i++) {
					options += "<option value='" + list[i].id + "'>" + list[i].name + "</option>";
				}
				return "" + 
					"<div class='form-inline'>" +
						"<select class='input_select'>" +  options + "</select>" +
						"<div class='input_datepicker input-append date ml5'>" +
							"<input type='text' class='input_date' readonly value='截止日期' />" +
							"<span class='add-on'><i class='icon-th'></i></span>" +
						"</div>" +
					"</div>" +
					"<div class='mt10'><input name='taskTitle' type='text' required/></div>";
			},
			
			menu: function() {
				return "" +
					"<ul class='dropdown-menu' role='menu'>" +
						"<li>" +
							"<a class='task_defer' href='#'>" +
								"<i class='icon-edit'></i>延期" +
							"</a>" +
						"</li>" + 
						"<li>" +
							"<a class='task_edit' href='#'>" +
								"<i class='icon-edit'></i>编辑" +
							"</a>" +
						"</li>" + 
						"<li>" +
							"<a class='task_remove' href='#'>" +
								"<i class='icon-remove'></i>删除" +
							"</a>" +
						"</li>" + 
					"</ul>";
			}
		}
	};
})(window);