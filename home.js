document.addEventListener('DOMContentLoaded', function() {
    function updateProjects() {
        const projectsContainer = document.querySelector(".projects-container");
        projectsContainer.innerHTML = ''; // Clear existing projects

        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        console.log(projects);

        projects.forEach(function(project, index) {
            const projectElement = document.createElement('a');
            projectElement.href = `project.html?id=${index}`; // Link to project page
            projectElement.className = 'square-box';

            const header = document.createElement('div');
            header.className = 'box-1-header';
            header.textContent = project.name;

            const deadlineLabel = document.createElement('div');
            deadlineLabel.className = 'deadline-label';
            const deadlineLabelText = document.createElement('label');
            deadlineLabelText.textContent = 'Completion Date:';
            const completionDateSpan = document.createElement('span');
            completionDateSpan.textContent = project.completionDate || 'No completion date available';

            deadlineLabel.appendChild(deadlineLabelText);
            deadlineLabel.appendChild(completionDateSpan);

            projectElement.appendChild(header);
            projectElement.appendChild(deadlineLabel);

            projectsContainer.appendChild(projectElement);


            
        }) 
    }

    // Function to add a new project
    function addProject() {
        const projectName = prompt('Enter project name:');
        if (projectName) {
            const newProject = {
                name: projectName,
                completionDate: '',
                tasks: [] // Add logic to set completion date
            };

            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            projects.push(newProject);
            localStorage.setItem('projects', JSON.stringify(projects));

            updateProjects(); // Update the displayed projects
        }
    }

    // Event listener for Add Project button
    document.getElementById('addProjectButton').addEventListener('click', addProject);

    // Initial update of projects on page load
    updateProjects();
});
