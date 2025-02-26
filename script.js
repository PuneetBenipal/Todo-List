
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
                    taskInput.value = '';
                    updateStats();
                    checkEmptyState();
                }
            });