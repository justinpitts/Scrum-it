/** Sort Functions **/
function sortByName(a, b) {
	return a.name > b.name ? 1 : -1;
}

function sortByLastName(a, b) {
	return a.lastName > b.lastName ? 1 : -1;
}

function sortBySlogan(a, b) {
	return a.slogan > b.slogan ? 1 : -1;
}

function sortById(a, b) {
	return a.id > b.id ? 1 : -1;
}

/** Date Functions **/
function dateFromTimestamp(timestamp) {
	var time = new Date();
	time.setTime(timestamp);
	var Tag = time.getDate();
	var Monat = time.getMonth()+1;
	var Jahr = time.getFullYear();
	var Std = time.getHours();
	var Min = time.getMinutes();
	var Sek = time.getSeconds();
	var TagAusgabe = ((Tag < 10) ? "0" + Tag : Tag);
	var MonatAusgabe = ((Monat < 10) ? "0" + Monat : Monat);
	var StdAusgabe = ((Std < 10) ? "0" + Std : Std);
	var MinAusgabe = ((Min < 10) ? "0" + Min : Min);
	var SekAusgabe = ((Sek < 10) ? "0" + Sek : Sek);
	return TagAusgabe+'.'+MonatAusgabe+'.'+Jahr+' '+StdAusgabe+':'+MinAusgabe+':'+SekAusgabe;
}

/** Dimensions Functions **/
function setDimensionsForProjectPerson() {
	$('#listingdata').css({height: ($(window).height() - $(".mainheader").outerHeight() - $(".mainfooter").outerHeight())});
	$('#listing').css({height: ($(window).height() - $(".mainheader").outerHeight() - $(".mainfooter").outerHeight())});
	$('#wrapper-projectlist').css({height: ($('#listing').height() - 87)});
	$('#wrapper-personlist').css({height: ($('#smalllisting').height() - 87)});
	$('#data').css({height: $('#listingdata').height() - $('#smalllisting').height()});
}

function setDimensionsForSprintUserstory() {
	$('#listingdata').css({height: ($(window).height() - $(".mainheader").outerHeight() - $(".mainfooter").outerHeight())});
	$('#listing').css({height: ($(window).height() - $(".mainheader").outerHeight() - $(".mainfooter").outerHeight())});
	$('#wrapper-sprintlist').css({height: ($('#listing').height() - 87)});	
	$('#wrapper-userstorylist').css({height: ($('#smalllisting').height() - 87)});
	$('#wrapper-sprintuserstory').css({height: $('#listingdata').height() - $('#smalllisting').height()});
}

function setBoardDimensions() {
	$('#board').css({height: ($(window).height() - $(".mainheader").outerHeight() - $(".mainfooter").outerHeight())});
	if($("#burndownchart").is(":visible")) {
		loadBurnDownChart();
	}
}

/** PROJECT **/
function getAllProjects() {
	$.getJSON("allprojects/", function(data) {
		var projectList = $('#projectlist').empty();
		var showSearchBar = false;
		$.each(data.sort(sortByName), function(id, project) {
			projectList.append($('<li><a href="#" data-value="'+project.id+'" class="project-action">'+project.name+'</a><a href="../sprint/'+project.id+'/" rel="external" title="Link to Sprints of Project \''+project.name+'\'">Link to Sprints of Project \''+project.name+'\'</a></li>'));
			showSearchBar = true;
		});
		$(projectList).listview("refresh");
		if (!isNaN(selectedProjectId)) {
			$('#projectlist li .project-action').each(function(index) {
				if ($(this).data("value") == selectedProjectId) {
					$(this).parent().parent().parent().addClass("ui-btn-active");
				}
			});
		}
		if (showSearchBar) {
			$("#listing form.ui-listview-filter").show();
		} else {
			$("#listing form.ui-listview-filter").hide();
		}
	});
}

function getProject(projectId) {		
	$.getJSON(projectId+"/", function(data) {
		selectedProjectId = data.id;
		$('#personlist li').each(function(index) {
			$(this).removeClass("ui-btn-active");
		});
		$("#listshowhideperson").show();
		$("#projectform-add").hide();
		$("#personform-add").hide();
		$("#personform-update").hide();
		$(".project-remove-button").show();

		$(".mainheader h1").html("Project: <strong>"+data.name+"</strong>");
		$('#label-project-id').val(data.id)[0].defaultValue = data.id;
		$('#label-name').val(data.name)[0].defaultValue = data.name;
		$('#label-description').val(data.description)[0].defaultValue = data.description;
		var date = dateFromTimestamp(data.creationDate);
		$('#label-creationdate').val(date)[0].defaultValue = date;
	});
}

function selectProject() {
	selectedPersonId = Number.NaN;
	$('#projectlist li').each(function(index) {
		$(this).removeClass("ui-btn-active");
	});
	$(this).parent().parent().parent().addClass("ui-btn-active");
	getAllPersons($(this).data("value"));
	getProject($(this).data("value"));
}

function addProjectAction() {
	$("#listshowhideperson").hide();
	$("#projectform-add").show();
	$("#projectform-update").hide();
	$("#personform-add").hide();
	$("#personform-update").hide();
	var personList = $('#personlist').empty();
}

function addProject() {
	var project = $(this).serializeObject();
	$.postJSON(
		"add/", 
		project, 
		function(data) {
			selectedProjectId = data.project.id;
			getAllProjects();
			getProject(data.project.id);
			getAllPersons(data.project.id);
			$('#label-add-name').val("");
			$('#label-add-description').val("");
			alert("Project '"+data.project.name+"' added successfully.");
		}, 
		function(xhr, error) {
			//alert("readyState: "+xhr.readyState+"\nstatus: "+xhr.status);
			var errorJSON = JSON.parse(xhr.responseText);
			var errors = "Add Project Error!";
			for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
				errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
			}
			alert(errors);
		}
	);
	return false;
}

function updateProject() {
	var project = $(this).serializeObject();
	$.postJSON(
		"update/", 
		project, 
		function(data) {
			$(".mainheader h1").html("Project: <strong>"+data.project.name+"</strong>");
			$('#label-name').val(data.project.name)[0].defaultValue = data.project.name;
			$('#label-description').val(data.project.description)[0].defaultValue = data.project.description;
			alert("Project '"+data.project.name+"' updated successfully.");
			getAllProjects();
		}, 
		function(xhr, error) {
			var errorJSON = JSON.parse(xhr.responseText);
			var errors = "Update Project Error!";
			for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
				errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
			}
			alert(errors);
		}
	);
	return false;
}

function removeProject() {
	if (confirm("Do you really want to delete project '"+$('#label-name').val()+"'?")) {
		$.getJSON("remove/"+$('#label-project-id').val()+"/", function() {
			selectedProjectId = Number.NaN;
			getAllProjects();
			$(".mainheader h1").html("Projects");
			$("#listshowhideperson").hide();
			$(".project-remove-button").hide();
			alert("Project '"+$('#label-name').val()+"' successfully removed.");
		});
	}
}

/** PERSON **/
function getAllPersons(projectId) {
	$(".person-remove-button").hide();
	$("#personform-update").hide();
	$.getJSON("allpersons/"+projectId+"/", function(data) {
		var personList = $('#personlist').empty();
		var showSearchBar = false;
		$.each(data.sort(sortByLastName), function(id, person) {
			personList.append($('<li><a href="#" data-value="'+person.id+'" class="person-action">'+person.lastName+' '+person.firstName+'</a></li>'));
			showSearchBar = true;
		});
		$(personList).listview("refresh");
		if (!isNaN(selectedPersonId)) {
			$('#personlist li .person-action').each(function(index) {
				if ($(this).data("value") == selectedPersonId) {
					$(this).parent().parent().parent().addClass("ui-btn-active");
				}
			});
		}
		if (showSearchBar) {
			$("#smalllisting form.ui-listview-filter").show();
		} else {
			$("#smalllisting form.ui-listview-filter").hide();
		}
		$("#person-addremove-bar").show();
	});
}

function getPerson(personId) {
	$("#projectform-add").hide();
	$("#personform-add").hide();
	$("#projectform-update").hide();
	$("#personform-update").show();
	$(".person-remove-button").show();
	$.getJSON("person/"+personId+"/", function(data) {
		selectedPersonId = data.id;
		$('#label-person-id').val(data.id)[0].defaultValue = data.id;
		$('#label-firstname').val(data.firstName)[0].defaultValue = data.firstName;
		$('#label-lastname').val(data.lastName)[0].defaultValue = data.lastName;
		$('#label-email').val(data.email)[0].defaultValue = data.email;
		$("#listing form.ui-listview-filter").show();
	});
}

function selectPerson() {
	$('#personlist li').each(function(index) {
		$(this).removeClass("ui-btn-active");
	});
	$(this).parent().parent().parent().addClass("ui-btn-active");
	getPerson($(this).data("value"));
}

function addPersonAction() {
	$("#projectform-add").hide();
	$("#personform-add").show();
	$("#projectform-update").hide();
	$("#personform-update").hide();
}

function addPerson() {
	var person = $(this).serializeObject();
	$.postJSON(
		"person/add/"+$('#label-project-id').val()+"/", 
		person, 
		function(data) {
			selectedPersonId = data.person.id;
			getAllPersons($('#label-project-id').val());
			$('#label-add-firstname').val("");
			$('#label-add-lastname').val("");
			$('#label-add-email').val("");
			alert("Person '"+data.person.firstName+" "+data.person.lastName+"' added successfully.");
			getPerson(data.person.id);
		}, 
		function (xhr, error) {
			var errorJSON = JSON.parse(xhr.responseText);
			var errors = "Add Person Error!";
			for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
				errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
			}
			alert(errors);
		}
	);
	return false;
}

function updatePerson() {
	var person = $(this).serializeObject();
	$.postJSON(
		"person/update/", 
		person, 
		function(data) {
			$('#label-firstname').val(data.person.firstName)[0].defaultValue = data.person.firstName;
			$('#label-lastname').val(data.person.lastName)[0].defaultValue = data.person.lastName;
			$('#label-email').val(data.person.email)[0].defaultValue = data.person.email;
			getAllPersons($('#label-project-id').val());
			getPerson(data.person.id);
			alert("Person '"+data.person.firstName+" "+data.person.lastName+"' updated successfully.");
		}, 
		function(xhr, error) {
			var errorJSON = JSON.parse(xhr.responseText);
			var errors = "Update Person Error!";
			for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
				errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
			}
			alert(errors);
		}
	);
	return false;
}

function removePerson() {
	if (confirm("Do you really want to delete person '"+$('#label-firstname').val()+" "+$('#label-lastname').val()+"'?")) {
		$.getJSON("person/remove/"+$('#label-person-id').val()+"/", function() {
			selectedPersonId = Number.NaN;
			getAllPersons($('#label-project-id').val());
			$("#personform-update").hide();
			alert("Person '"+$('#label-firstname').val()+" "+$('#label-lastname').val()+"' successfully removed.");
		});
	}
}

/** SPRINT **/
function getAllSprintsByProjectId(projectId) {
	$.getJSON("../all/"+projectId+"/", function(data) {
		var sprintList = $('#sprintlist').empty();
		var showSearchBar = false;
		$.each(data.sort(sortById), function(id, sprint) {
			sprintList.append($('<li><a href="#" data-value="'+sprint.id+'" class="sprint-action">'+sprint.slogan+'</a><a href="../../board/'+projectId+'/'+sprint.id+'/" rel="external" title="Link to Board of Sprint \''+sprint.slogan+'\'">Link to Board of Sprint \''+sprint.slogan+'\'</a></li>'));
			showSearchBar = true;
		});
		$(sprintList).listview("refresh");
		if (!isNaN(selectedSprintId)) {
			$('#sprintlist li .sprint-action').each(function(index) {
				if ($(this).data("value") == selectedSprintId) {
					$(this).parent().parent().parent().addClass("ui-btn-active");
				}
			});
		}
		if (showSearchBar) {
			$("#listing form.ui-listview-filter").show();
		} else {
			$("#listing form.ui-listview-filter").hide();
		}
	});
}

function getSprint(sprintId) {
	$.getJSON("../sprint/"+sprintId+"/", function(data) {
		selectedSprintId = data.id;
		$('#userstorylist li').each(function(index) {
			$(this).removeClass("ui-btn-active");
		});
		$("#listshowhideuserstory").show();
		$("#sprintform-add").hide();
		$("#userstoryform-add").hide();
		$("#userstoryform-update").hide();
		$(".sprint-remove-button").show();

		$(".mainheader h1").html("Project: <strong>"+projectName+"</strong> - Sprint: <strong>"+data.slogan+"</strong>");
		$('#label-sprint-id').val(data.id)[0].defaultValue = data.id;
		$('#label-slogan').val(data.slogan)[0].defaultValue = data.slogan;
		var startDate = (dateFromTimestamp(data.startDate).substr(0,10));
		var endDate = (dateFromTimestamp(data.endDate).substr(0,10));
		$('#label-startdate').val(startDate)[0].defaultValue = startDate;
		$('#label-enddate').val(endDate)[0].defaultValue = endDate;
	});
}

function selectSprint() {
	selectedSprintId = Number.NaN;
	$('#sprintlist li').each(function(index) {
		$(this).removeClass("ui-btn-active");
	});
	$(this).parent().parent().parent().addClass("ui-btn-active");
	getAllUserstories($(this).data("value"));
	getSprint($(this).data("value"));
}

function addSprintAction() {
	$("#listshowhideuserstory").hide();
	$("#sprintform-add").show();
	$("#sprintform-update").hide();
	$("#userstoryform-add").hide();
	$("#userstoryform-update").hide();
	var userstoryList = $('#userstorylist').empty();
}

function addSprint() {
	var maxDifferenceInDays = 60;
	var sprint = $(this).serializeObject();
	var startDate = isValidDate($('#label-add-startdate').val(), "DMY");
	var endDate = isValidDate($('#label-add-enddate').val(), "DMY");
	if (!startDate || !endDate) {
		alert("'Start date' or 'End date' is not valid, it must be in the format 'dd.MM.yyyy'.");
	} else {
		if (startDate < endDate) {
			if (daysBetweenTwoDates(startDate, endDate) <= maxDifferenceInDays) {
				$.postJSON(
					"../add/"+projectId+"/", 
					sprint, 
					function(data) {
						selectedSprintId = data.sprint.id;
						getAllSprintsByProjectId(projectId);
						getSprint(data.sprint.id);
						getAllUserstories(data.sprint.id);
						$('#label-add-slogan').val("");
						$('#label-add-startdate').val("");
						$('#label-add-enddate').val("");
						alert("Sprint '"+data.sprint.slogan+"' added successfully.");
					}, 
					function(xhr, error) {
						var errorJSON = JSON.parse(xhr.responseText);
						var errors = "Add Sprint Error!";
						for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
							errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
						}
						alert(errors);
					}
				);
			} else {
				alert("The date difference must be lower than "+maxDifferenceInDays+" days.");
			}
		} else {
			alert("Not valid: 'EndDate' is before 'StartDate'.");
		}
	}
	return false;
}

function updateSprint() {
	var sprint = $(this).serializeObject();
	$.postJSON(
		"../update/", 
		sprint, 
		function(data) {
			$(".mainheader h1").html("Project: <strong>"+projectName+"</strong> - Sprint: <strong>"+data.sprint.slogan+"</strong>");
			$('#label-slogan').val(data.sprint.slogan)[0].defaultValue = data.sprint.slogan;
			var startDate = (dateFromTimestamp(data.sprint.startDate).substr(0,10));
			var endDate = (dateFromTimestamp(data.sprint.endDate).substr(0,10));
			$('#label-startdate').val(startDate)[0].defaultValue = startDate;
			$('#label-enddate').val(endDate)[0].defaultValue = endDate;
			alert("Sprint '"+data.sprint.slogan+"' updated successfully");
			getAllSprintsByProjectId(projectId);
		}, 
		function(xhr, error) {
			var errorJSON = JSON.parse(xhr.responseText);
			var errors = "Update Sprint Error!";
			for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
				errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
			}
			alert(errors);
		}
	);
	return false;
}

function removeSprint() {
	if (confirm("Do you really want to delete sprint '"+$('#label-slogan').val()+"'?")) {
		$.getJSON("../remove/"+$('#label-sprint-id').val()+"/", function() {
			selectedSprintId = Number.NaN;
			getAllSprintsByProjectId(projectId);
			$(".mainheader h1").html("Sprints");
			$("#listshowhideuserstory").hide();
			$(".sprint-remove-button").hide();
			alert("Sprint '"+$('#label-slogan').val()+"' successfully removed.");
		});
	}
}

/** USERSTORY **/
function getAllUserstories(sprintId) {
	$(".userstory-remove-button").hide();
	$("#userstoryform-update").hide();
	$.getJSON("../alluserstories/"+sprintId+"/", function(data) {
		var userstoryList = $('#userstorylist').empty();
		var showSearchBar = false;
		$.each(data.sort(sortByName), function(id, userstory) {
			userstoryList.append($('<li><a href="#" data-value="'+userstory.id+'" class="userstory-action">'+userstory.name+'</a></li>'));
			showSearchBar = true;
		});
		$(userstoryList).listview("refresh");
		if (!isNaN(selectedUserstoryId)) {
			$('#userstorylist li .userstory-action').each(function(index) {
				if ($(this).data("value") == selectedUserstoryId) {
					$(this).parent().parent().parent().addClass("ui-btn-active");
				}
			});
		}
		if (showSearchBar) {
			$("#smalllisting form.ui-listview-filter").show();
		} else {
			$("#smalllisting form.ui-listview-filter").hide();
		}
		$("#userstory-addremove-bar").show();
	});
}

function getUserstory(userstoryId) {
	$("#sprintform-add").hide();
	$("#userstoryform-add").hide();
	$("#sprintform-update").hide();
	$("#userstoryform-update").show();
	$(".userstory-remove-button").show();
	$.getJSON("../userstory/"+userstoryId+"/", function(data) {
		selectedUserstoryId = data.id;
		$('#label-userstory-id').val(data.id)[0].defaultValue = data.id;
		$('#label-name').val(data.name)[0].defaultValue = data.name;
		$('#label-priority').val(data.priority)[0].defaultValue = data.priority;
		var creationDate = dateFromTimestamp(data.creationDate);
		$('#label-creationdate').val(creationDate)[0].defaultValue = creationDate;
		$('#label-estimatedsize').val(data.estimatedSize)[0].defaultValue = data.estimatedSize;
		$('#label-acceptancetest').val(data.acceptanceTest)[0].defaultValue = data.acceptanceTest;
		$("#listing form.ui-listview-filter").show();
	});
}

function selectUserstory() {
	$('#userstorylist li').each(function(index) {
		$(this).removeClass("ui-btn-active");
	});
	$(this).parent().parent().parent().addClass("ui-btn-active");
	getUserstory($(this).data("value"));
	updateScroll();
}

function addUserstoryAction() {
	$("#sprintform-add").hide();
	$("#userstoryform-add").show();
	$("#sprintform-update").hide();
	$("#userstoryform-update").hide();
}

function addUserstory() {
	var userstory = $(this).serializeObject();
	if (userstory.priority == "" || !isNumeric(userstory.priority)) userstory.priority = -1;
	if (userstory.estimatedSize == "" || !isNumeric(userstory.estimatedSize)) userstory.estimatedSize = -1;
	$.postJSON(
		"../add/userstory/"+$('#label-sprint-id').val()+"/", 
		userstory, 
		function(data) {
			selectedUserstoryId = data.userstory.id;
			getAllUserstories($('#label-sprint-id').val());
			$('#label-add-name').val("");
			$('#label-add-priority').val("");
			$('#label-add-estimatedsize').val("");
			$('#label-add-acceptancetest').val("");
			alert("Userstory '"+data.userstory.name+"' added successfully.");
			getUserstory(data.userstory.id);
		}, 
		function (xhr, error) {
			var errorJSON = JSON.parse(xhr.responseText);
			var errors = "Add Userstory Error!";
			for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
				errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
			}
			alert(errors);
		}
	);
	return false;
}

function updateUserstory() {
	var userstory = $(this).serializeObject();
	if (userstory.priority == "" || !isNumeric(userstory.priority)) userstory.priority = -1;
	if (userstory.estimatedSize == "" || !isNumeric(userstory.estimatedSize)) userstory.estimatedSize = -1;
	$.postJSON(
		"../userstory/update/", 
		userstory, 
		function(data) {
			$('#label-name').val(data.userstory.name)[0].defaultValue = data.userstory.name;
			$('#label-priority').val(data.userstory.priority)[0].defaultValue = data.userstory.priority;
			$('#label-estimatedsize').val(data.userstory.estimatedSize)[0].defaultValue = data.userstory.estimatedSize;
			$('#label-acceptancetest').val(data.userstory.acceptanceTest)[0].defaultValue = data.userstory.acceptanceTest;
			getAllUserstories($('#label-sprint-id').val());
			getUserstory(data.userstory.id);
			alert("Userstory '"+userstory.name+"' updated successfully.");
		}, 
		function(xhr, error) {
			var errorJSON = JSON.parse(xhr.responseText);
			var errors = "Update Userstory Error!";
			for(var key in errorJSON) if(errorJSON.hasOwnProperty(key)) {
				errors += "\n"+$("label[for="+$("input[name="+key+"]").attr("id")+"]").text()+" "+errorJSON[key];
			}
			alert(errors);
		}
	);
	return false;
}

function removeUserstory() {
	if (confirm("Do you really want to delete userstory '"+$('#label-name').val()+"'?")) {
		$.getJSON("../userstory/remove/"+$('#label-userstory-id').val()+"/", function() {
			selectedUserstoryId = Number.NaN;
			getAllUserstories($('#label-sprint-id').val());
			$("#userstoryform-update").hide("slow");
			alert("Userstory '"+$('#label-name').val()+"' successfully removed.");
		});
	}
}

/** TASK **/

/** BOARD **/
function loadBurnDownChart() {
	if (taskDuration > 0) {
		$.getJSON("../../burndown/"+sprintId+"/", function(data) {
			$.jqplot.config.enablePlugins = true;
			ticks = new Array();
			real = new Array();
			optimal = new Array();
			var workdays = -1;
			nowIndex = -1;
			$.each(data, function(id, bd) {
				if (id % 2 == 0) {
					ticks.push(bd.date.substr(0,5));
				} else {
					ticks.push('|');
				}
	
				var yyyy = parseInt(bd.date.substr(6,4));
				var mm = parseInt((bd.date.substr(3,2)).replace (/^0+/,""));
				var dd = parseInt((bd.date.substr(0,2)).replace (/^0+/,""));
				var currentDate = new Date(yyyy, --mm, dd);
				now = new Date();
				if (currentDate.getFullYear() == now.getFullYear() && 
						currentDate.getMonth() == now.getMonth() && 
						currentDate.getDate() == now.getDate()) {
					nowIndex = id;
				}
				if (currentDate.getDay() != 0 && currentDate.getDay() != 6) {
					workdays++;
				}
				
				var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				if (currentDate - today <= 0) {
					real.push(bd.open);
				} else {
					real.push(null);
				}
			});
			durationPerWorkday = taskDuration / workdays;
			if (taskDuration != 0) {
			i = 0;
			$.each(data, function(id, bd) {
				yyyy = parseInt(bd.date.substr(6,4));
				mm = parseInt((bd.date.substr(3,2)).replace (/^0+/,""));
				dd = parseInt((bd.date.substr(0,2)).replace (/^0+/,""));
				currentDate = new Date(yyyy, --mm, dd);
				if (currentDate.getDay() != 0 && currentDate.getDay() != 6) {
					optimal.push(taskDuration - (i*durationPerWorkday));
					i++;
				} else {
					if (optimal.length == 0) {
						optimal.push(taskDuration);
					} else {
						optimal.push(optimal[(optimal.length-1)]);
					}
				}
			});
			}
			if (nowIndex == -1)
				today = [[0, 0], [0, taskDuration]];
			else 
				today = [[nowIndex+1, -100], [nowIndex+1, taskDuration]];
	
			plot = $.jqplot('burndownchart', [real, optimal, today], {
				title: 'Burn Down Chart', 
				legend: {
					show: true, 
					location: 'ne'
				}, 
				series: [
					{label: 'real burn down'},
					{label: 'ideal burn down'}, 
					{label: 'today', lineWidth:1, color:'#999999', showMarker:false}
				],
				axes: {
					xaxis:{
						renderer: $.jqplot.CategoryAxisRenderer, 
						ticks: ticks, 
						tickOptions: {
							fontSize: '8pt'
						}
					}, 
					yaxis:{
						min: 0, 
						numberTicks: 8
					}
				}, 
				highlighter: {
					sizeAdjust: 10, 
					tooltipLocation: 'n', 
					tooltipAxes: 'y', 
					tooltipFormatString: '<b>remaining effort: %d</b>', 
					useAxesFormatters: false
				},
				cursor: {
					show: true, 
					tooltipOffset: 10, 
					tooltipLocation: 'sw'
				}
			});
			plot.redraw();
		});
		$("#burndownchart").show();
	}
}

/** OTHER **/
function toggleShow() {
	if($("#burndownchart").is(":visible")) {
		$("#burndownchart").hide();
	} else {
		loadBurnDownChart();
	}
}

/** HELPER **/
/** Source: http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256C0800602A52 **/
function isValidDate(dateStr, format) {
	if (format == null) { format = "MDY"; }
	format = format.toUpperCase();
	if (format.length != 3) { format = "MDY"; }
	if ( (format.indexOf("M") == -1) || (format.indexOf("D") == -1) || 
			(format.indexOf("Y") == -1) ) { format = "MDY"; }
	if (format.substring(0, 1) == "Y") { // If the year is first
		var reg2 = /^\d{4}(\.)\d{1,2}\1\d{1,2}$/;
	} else if (format.substring(1, 2) == "Y") { // If the year is second
		var reg2 = /^\d{1,2}(\.)\d{4}\1\d{1,2}$/;
	} else { // The year must be third
		var reg2 = /^\d{1,2}(\.)\d{1,2}\1\d{4}$/;
	}
	// If it doesn't conform to the right format, fail
	if ( (reg2.test(dateStr) == false) ) { return false; }
	var parts = dateStr.split(RegExp.$1); // Split into 3 parts based on what the divider was
	// Check to see if the 3 parts end up making a valid date
	if (format.substring(0, 1) == "M") { var mm = parts[0]; } else 
		if (format.substring(1, 2) == "M") { var mm = parts[1]; } else { var mm = parts[2]; }
	if (format.substring(0, 1) == "D") { var dd = parts[0]; } else 
		if (format.substring(1, 2) == "D") { var dd = parts[1]; } else { var dd = parts[2]; }
	if (format.substring(0, 1) == "Y") { var yy = parts[0]; } else 
		if (format.substring(1, 2) == "Y") { var yy = parts[1]; } else { var yy = parts[2]; }
	if (parseFloat(yy) <= 50) { yy = (parseFloat(yy) + 2000).toString(); }
	if (parseFloat(yy) <= 99) { yy = (parseFloat(yy) + 1900).toString(); }
	var dt = new Date(parseFloat(yy), parseFloat(mm)-1, parseFloat(dd), 0, 0, 0, 0);
	if (parseFloat(dd) != dt.getDate()) { return false; }
	if (parseFloat(mm)-1 != dt.getMonth()) { return false; }
	return dt;
}

function daysBetweenTwoDates(date1, date2) {
    return Math.round(Math.abs(date1.getTime() - date2.getTime())/(1000 * 60 * 60 * 24));
}

function isNumeric(text) {
	var validChars = "0123456789";
	var isNumeric = true;
	var myChar;
	for (i = 0; i < text.length && isNumeric; i++) {
		myChar = text.charAt(i);
		if (validChars.indexOf(myChar) == -1) {
			isNumeric = false;
		}
	}
	return isNumeric;
}