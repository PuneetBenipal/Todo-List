document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const totalCount = document.getElementById('total-count');
    const activeCount = document.getElementById('active-count');
    const completedCount = document.getElementById('completed-count');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const dateText = document.getElementById('date-text');
    
    // App State
    let tasks = [];
    let currentFilter = 'all';
    
    // Load tasks from localStorage
    function loadTasks() {
        const storedTasks = localStorage.getItem('nighttasks');
        if (storedTasks) {
            try {
                tasks = JSON.parse(storedTasks);
            } catch (e) {
                console.error('Error parsing tasks from localStorage', e);
                tasks = [];
            }
        }
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        try {
            localStorage.setItem('nighttasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks to localStorage', e);
        }
    }
    
    // Add new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            shakeElement(taskInput);
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            isPinned: false
        };
        
        tasks.unshift(newTask); // Add to beginning of array
        saveTasks();
        renderTasks();
        
        // Reset input
        taskInput.value = '';
        taskInput.focus();
        
        // Apply animation class to newly added task
        setTimeout(() => {
            const taskElement = document.querySelector(`.task[data-id="${newTask.id}"]`);
            if (taskElement) {
                taskElement.classList.add('just-added');
                setTimeout(() => {
                    taskElement.classList.remove('just-added');
                }, 500);
            }
        }, 10);
    }
    
    // Delete task
    function deleteTask(taskId) {
        const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('deleting');
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
            }, 500);
        }
    }
    
    // Toggle task completion
    function toggleTaskCompletion(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const isCompleting = !tasks[taskIndex].completed;
            tasks[taskIndex].completed = isCompleting;
            tasks[taskIndex].completedAt = isCompleting ? new Date().toISOString() : null;
            
            saveTasks();
            renderTasks();
            
            // Apply animation
            const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
            if (taskElement && isCompleting) {
                taskElement.classList.add('just-completed');
                setTimeout(() => {
                    taskElement.classList.remove('just-completed');
                }, 500);
            }
        }
    }
    
    // Toggle pin status
    function togglePinTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].isPinned = !tasks[taskIndex].isPinned;
            
            // Sort tasks to bring pinned tasks to top
            tasks.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0;
            });
            
            saveTasks();
            renderTasks();
        }
    }
    
    // Edit task
    function editTask(taskId, newText) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1 && newText.trim() !== '') {
            tasks[taskIndex].text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }
    
    // Enable edit mode for a task
    function enableEditMode(taskId) {
        const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
        const taskTextElement = taskElement.querySelector('.task-text');
        const originalText = taskTextElement.textContent;
        
        // Create input field
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = originalText;
        inputElement.className = 'task-input';
        inputElement.style.width = '100%';
        inputElement.style.padding = '0.5rem';
        
        // Replace text with input
        taskTextElement.innerHTML = '';
        taskTextElement.appendChild(inputElement);
        inputElement.focus();
        
        // Add event listeners
        inputElement.addEventListener('blur', () => {
            editTask(taskId, inputElement.value);
        });
        
        inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                editTask(taskId, inputElement.value);
            } else if (e.key === 'Escape') {
                taskTextElement.textContent = originalText;
            }
        });
    }
    
    // Clear all completed tasks
    function clearCompletedTasks() {
        const hasCompleted = tasks.some(task => task.completed);
        if (!hasCompleted) return;
        
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }
    
    // Filter tasks based on current filter
    function filterTasks() {
        if (currentFilter === 'all') {
            return tasks;
        } else if (currentFilter === 'active') {
            return tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            return tasks.filter(task => task.completed);
        }
        return tasks;
    }
    
    // Update task counts
    function updateTaskCounts() {
        const totalTaskCount = tasks.length;
        const completedTaskCount = tasks.filter(task => task.completed).length;
        const activeTaskCount = totalTaskCount - completedTaskCount;
        
        totalCount.textContent = totalTaskCount;
        completedCount.textContent = completedTaskCount;
        activeCount.textContent = activeTaskCount;
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Render tasks to the DOM
    function renderTasks() {
        const filteredTasks = filterTasks();
        
        // Update task counts
        updateTaskCounts();
        
        // Show/hide empty state
        if (filteredTasks.length === 0) {
            todoList.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            todoList.style.display = 'block';
            emptyState.style.display = 'none';
        }
        
        // Clear current tasks
        todoList.innerHTML = '';
        
        // Render filtered tasks
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.completed ? 'completed' : ''} ${task.isPinned ? 'pinned' : ''}`;
            taskElement.setAttribute('data-id', task.id);
            
            const checkboxElement = document.createElement('div');
            checkboxElement.className = `task-check ${task.completed ? 'checked' : ''}`;
            
            const taskTextElement = document.createElement('div');
            taskTextElement.className = 'task-text';
            taskTextElement.textContent = task.text;
            
            const taskCompletedDate = document.createElement('div');
            taskCompletedDate.className = 'task-completed-date';
            if (task.completedAt) {
                taskCompletedDate.textContent = `Completed: ${formatDate(task.completedAt)}`;
            }
            
            const taskActionsElement = document.createElement('div');
            taskActionsElement.className = 'task-actions';
            
            // Create pin button
            const pinBtn = document.createElement('button');
            pinBtn.className = 'action-btn pin-btn';
            pinBtn.innerHTML = `<i class="fas ${task.isPinned ? 'fa-thumbtack' : 'fa-thumbtack'}"></i>`;
            pinBtn.title = task.isPinned ? 'Unpin task' : 'Pin task';
            
            // Create edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit-btn';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.title = 'Edit task';
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.title = 'Delete task';
            
            // Append actions
            taskActionsElement.appendChild(pinBtn);
            taskActionsElement.appendChild(editBtn);
            taskActionsElement.appendChild(deleteBtn);
            
            // Append all elements to task
            taskElement.appendChild(checkboxElement);
            taskElement.appendChild(taskTextElement);
            taskTextElement.appendChild(taskCompletedDate);
            taskElement.appendChild(taskActionsElement);
            
            // Add event listeners
            checkboxElement.addEventListener('click', () => {
                toggleTaskCompletion(task.id);
            });
            
            pinBtn.addEventListener('click', () => {
                togglePinTask(task.id);
            });
            
            editBtn.addEventListener('click', () => {
                enableEditMode(task.id);
            });
            
            deleteBtn.addEventListener('click', () => {
                deleteTask(task.id);
            });
            
            // Add to list
            todoList.appendChild(taskElement);
        });
    }
    
    // Set current date
    function setCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateText.textContent = now.toLocaleDateString(undefined, options);
    }
    
    // Simple shake animation for validation feedback
    function shakeElement(element) {
        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 500);
    }
    
    // Add necessary CSS for shake animation if it doesn't exist
    if (!document.querySelector('.shake-animation-style')) {
        const style = document.createElement('style');
        style.className = 'shake-animation-style';
        style.textContent = `
            @keyframes shakeAnimation {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-10px); }
                40%, 80% { transform: translateX(10px); }
            }
            .shake-animation {
                animation: shakeAnimation 0.5s ease;
                border-color: var(--danger) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Event Listeners
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    addBtn.addEventListener('click', addTask);
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            currentFilter = filter;
            
            // Update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            renderTasks();
        });
    });
    
    // Initialize app
    function initApp() {
        loadTasks();
        setCurrentDate();
        renderTasks();
    }
    
    initApp();
});