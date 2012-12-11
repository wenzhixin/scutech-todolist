/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-12-11
 */

(function() {
	'use strict';
	
	var taskManager = new TaskManager(); 
	
	function getTasks() {
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
					chrome.browserAction.setBadgeText({text: count > 0 ? count + '' : ''});
				} catch(e) {
					
				}
				setTimeout(getTasks, 600000);
			});
		});
	}

	getTasks();
})();
