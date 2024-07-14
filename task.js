document.addEventListener('DOMContentLoaded', function() {
    // Get the modal
    var firstAddModal = document.getElementById("firstAddTaskModal");
    var addModal = document.getElementById("addTaskModal");
    var editModal = document.getElementById("editTaskModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close");

    // When the user clicks on <span> (x), close the modal

    Array.from(span).forEach(function(element) {
        element.onclick = function(event) {
            addModal.style.display = "none";
            editModal.style.display = "none";
            doneModal.style.display = "none";
        };
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == addModal || event.target == editModal) {
            addModal.style.display = "none";
            editModal.style.display = "none";
            doneModal.style.display = "none";
        }
    }

    // Attach the event listener to the "Add Task" button
    document.getElementById("addTaskButton").onclick = function() {
        console.log('Add Task button clicked');
        openAddModal();
    };

    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return tasks;
    }

    function calculateEndDate(startDate, expectedRequiredDays) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            throw new Error("Invalid start date: " + startDate);
        }
        start.setDate(start.getDate() + parseInt(expectedRequiredDays));
        const endDate = start.toISOString().split('T')[0];
        if (isNaN(new Date(endDate).getTime())) {
            throw new Error("Invalid end date: " + endDate);
        }
        return endDate;
    }

    function calculateActualRequiredDays(actualStartDate, actualEndDate) {
        const start = new Date(actualStartDate);
        const end = new Date(actualEndDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime/ (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function calculateTaskDates(tasks) {
        if (tasks.length === 0) return;

        let currentStartDate = tasks[0].actualStartDate || tasks[0].startDate;
        console.log("current start date:", currentStartDate);
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[0].startDate !== '') {
                tasks[i].startDate = tasks[i].startDate || currentStartDate;
                try {
                    tasks[i].endDate = tasks[i].endDate || calculateEndDate(currentStartDate, tasks[i].expectedRequiredDays);
                    if (tasks[i].actualStartDate) {
                        tasks[i].expectedEndDate = calculateEndDate(tasks[i].actualStartDate, tasks[i].expectedRequiredDays);
                    }
                } catch (error) {
                    console.error("Error calculating dates for task:", tasks[i], error);
                    return;
                }
                if (i < tasks.length - 1) {
                    const nextStartDate = new Date(tasks[i].endDate);
                    nextStartDate.setDate(nextStartDate.getDate() + 1);                
                    currentStartDate = nextStartDate.toISOString().split('T')[0];
                }
            }
        }
    }

    function renderTasks(tasks, flag) {
        calculateTaskDates(tasks);
        const container = document.querySelector(".container");
        container.innerHTML = '';

        tasks.forEach((task, index) => {
            var taskContainer = document.createElement("div");
            taskContainer.className = "task-container";

            var newTask = document.createElement("div");
            newTask.className = "square-box";
            if (!tasks[index].actualStartDate) {
                newTask.innerHTML = `
                <div class="box-1-header">${task.name}</div>
                <div class="task-details">
                    <label for="task-start-date">Target Start Date: ${task.startDate}<br><br></label>
                    <label for="end-date">Target End Date: ${task.endDate}<br><br></label>
                    <label for="expected-required-days">Expected Required Days: ${task.expectedRequiredDays}<br><br></label>
                </div>
                `;
            }else if (tasks[index].actualEndDate){
                newTask.innerHTML = `
                <div class="box-1-header">${task.name}</div>
                <div class="task-details">
                    <label for="task-start-date">Target Start Date: ${task.startDate}<br><br></label>
                    <label for="end-date">Target End Date: ${task.endDate}<br><br></label>
                    <label for="expected-required-days">Expected Required Days: ${task.expectedRequiredDays}<br><br><br></label>
                    <label for="actual-start-date">Actual Start Date: ${task.actualStartDate}<br><br></label>
                    <label for="expected-end-date">Expected End Date: ${task.expectedEndDate}<br><br></label>
                    <label for="actual-end-date">Actual End Date: ${task.actualEndDate}<br><br></label>
                    <label for="actual-required-days">Actual Required Days: ${task.actualRequiredDays}<br><br></label>
                </div>
            `;
            } else {
                newTask.innerHTML = `
                <div class="box-1-header">${task.name}</div>
                <div class="task-details">
                    <label for="task-start-date">Target Start Date: ${task.startDate}<br><br></label>
                    <label for="end-date">Target End Date: ${task.endDate}<br><br></label>
                    <label for="expected-required-days">Expected Required Days: ${task.expectedRequiredDays}<br><br><br></label>
                    <label for="actual-start-date">Actual Start Date: ${task.actualStartDate}<br><br></label>
                    <label for="expected-end-date">Expected End Date: ${task.expectedEndDate}<br><br></label>
                </div>
            `;
            }
            
            taskContainer.appendChild(newTask);

            var editButton = document.createElement("button");
            editButton.className = "edit-task-button";
            editButton.innerText = "Edit Task";
            editButton.disabled = !!task.actualEndDate;
            editButton.addEventListener('click', function() {
                openEditModal(task, index);
            });

            taskContainer.appendChild(editButton);

            var deleteButton = document.createElement("button");
            deleteButton.className = "delete-task-button";
            deleteButton.innerText = "Delete Task";
            deleteButton.addEventListener('click', function() {
                if (!confirm ("Are you sure you want to delete this task?")) {
                    return;
                }
                tasks.splice(index, 1); // Remove task from array
                saveTasks(tasks); // Update local storage
                renderTasks(tasks); // Re-render tasks
            });

            taskContainer.appendChild(deleteButton);

            var doneButton = document.createElement("button");
            doneButton.className = "done-task-button";
            doneButton.innerText = "Set as Complete";
            doneButton.addEventListener('click', function() {
                markTaskAsDone(index, doneButton, editButton, deleteButton);
            });

            taskContainer.appendChild(doneButton);

            if (task.isComplete) {
                editButton.disabled = true;
                doneButton.disabled = true;
            }

            container.appendChild(taskContainer);
        });

        // Append the add task button
        var addTaskBox = document.createElement("div");
        addTaskBox.className = "add-task-box";
        addTaskBox.innerHTML = `
            <button id="addTaskButton">Add Task</button>
        `;

        container.appendChild(addTaskBox);

        document.getElementById("addTaskButton").onclick = function() {
            console.log('Add Task button clicked');
            openAddModal();
        };
    }


    function openAddModal() {
        const tasks = loadTasks();
     
        document.getElementById("addTaskForm").reset();

        if (tasks.length > 0) {
            document.getElementById("add-start-date").disabled = true;
        } else {
            document.getElementById("add-start-date").disabled = false;
        }

        document.getElementById("addTaskForm").onsubmit = function(event) {
            event.preventDefault();
    
            // Get task name and deadline
            var taskName = document.getElementById("add-task-name").value;
            var startDate = document.getElementById("add-start-date").value
            var expectedRequiredDays = document.getElementById("add-num-days").value;

         
            const tasks = loadTasks();

            tasks.push({
                name: taskName,
                startDate: startDate,
                actualStartDate: "",
                endDate: "",
                expectedRequiredDays: expectedRequiredDays
            });

            saveTasks(tasks);
            let flag = false;
            renderTasks(tasks, flag );
        
            // Clear the form
            document.getElementById("addTaskForm").reset();
        
            // Close the modal
            addModal.style.display = "none";
        }
        addModal.style.display = "block";     
    }

    function openEditModal(task, index) {
        document.getElementById("edit-task-name").value = task.name;
        document.getElementById("edit-start-date").value = task.startDate;
        document.getElementById("edit-num-days").value = task.expectedRequiredDays;
        document.getElementById("edit-actual-start-date").value = task.actualStartDate;

        const editStartDateInput = document.getElementById("edit-start-date");
        const editNumDaysInput = document.getElementById("edit-num-days");

        if (task.actualStartDate) {
            // Disable the target start and end dates if the actual start date is present
            editStartDateInput.disabled = true;
            editNumDaysInput.disabled = true;
        } else {
            // Enable the inputs if the actual start date is not present
            editStartDateInput.disabled = false;
            editNumDaysInput.disabled = false;
        }


        document.getElementById("editTaskForm").onsubmit = function(event) {
            event.preventDefault();

            const tasks = loadTasks();
            tasks[index] = task;

            task.actualStartDate = document.getElementById("edit-actual-start-date").value
    
            // Get task name and deadline
            if (task.actualStartDate !== "") {
                console.log("here");
                task.name = document.getElementById("edit-task-name").value;
                task.actualStartDate = document.getElementById("edit-actual-start-date").value
                task.expectedRequiredDays = document.getElementById("edit-num-days").value;
                task.expectedEndDate = calculateEndDate(task.actualStartDate, task.expectedRequiredDays);

                let currentStartDate = task.actualStartDate;
                task.actualStartDate = currentStartDate;
                task.expectedEndDate = calculateEndDate(currentStartDate, task.expectedRequiredDays);
                console.log("Actual start date", task.actualStartDate, "Expected end date: ", task.expectedEndDate);


            } else {
                task.name = document.getElementById("edit-task-name").value;
                task.startDate = document.getElementById("edit-start-date").value
                console.log("start date: ", task.startDate);
                task.expectedRequiredDays = document.getElementById("edit-num-days").value;
                task.endDate = calculateEndDate(task.startDate, task.expectedRequiredDays);

                let currentStartDate = task.startDate;
                task.startDate = currentStartDate;
                console.log("current start date", currentStartDate);
                task.expectedEndDate = calculateEndDate(currentStartDate, task.expectedRequiredDays);

            }
            
            
            console.log(task);
            console.log(index);

            
            saveTasks(tasks);
            let flag = true;
            renderTasks(tasks, flag);

            editModal.style.display = "none";
        };
        editModal.style.display = "block";
    }


    function markTaskAsDone(index, doneButton, editButton, deleteButton) {
        const tasks = loadTasks();
        const task = tasks[index];

        if (!task.actualStartDate) {
            alert("Task must have an actual start date before it can be completed.");
            return;
        }

       

        doneModal.style.display = "block";

        document.getElementById("doneTaskForm").onsubmit = function(event) {
            if (!confirm("Are you sure you want to mark this task as complete?")) {
                return;
            }

            event.preventDefault();

            const actualEndDate = document.getElementById("set-actual-end-date").value;

            if (new Date(actualEndDate) < new Date(task.actualStartDate)) {
                alert("Actual end date cannot be before actual start date.");
                return;
            }

            task.actualEndDate = actualEndDate;
            task.isComplete = true;
            task.actualRequiredDays = calculateActualRequiredDays(task.actualStartDate, actualEndDate);

            saveTasks(tasks);
            renderTasks(tasks);

            doneModal.style.display = "none";
        };
        
    }

    // Load and render tasks on page load
    const tasks = loadTasks();
    saveTasks(tasks);
    renderTasks(tasks);
});