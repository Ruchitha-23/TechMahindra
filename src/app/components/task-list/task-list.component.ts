import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TitleCasePipe, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  selectedTask: Task | undefined;
  showForm = false;
  errorMessage = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasksForCurrentUser().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  onAddTask(): void {
    this.selectedTask = undefined;
    this.showForm = true;
    this.errorMessage = '';
  }

  onSubmitTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): void {
    if (this.selectedTask) {
      const updatedTask: Task = {
        ...taskData,
        id: this.selectedTask.id,
        createdAt: this.selectedTask.createdAt,
        updatedAt: new Date().toISOString(),
        userId: this.selectedTask.userId
      };
      this.taskService.updateTask(updatedTask).subscribe({
        next: () => {
          this.loadTasks();
          this.showForm = false;
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    } else {
      this.taskService.addTask(taskData).subscribe({
        next: () => {
          this.loadTasks();
          this.showForm = false;
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }

  onEditTask(task: Task): void {
    this.selectedTask = task;
    this.showForm = true;
    this.errorMessage = '';
  }

  onDeleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }

  onCancelEdit(): void {
    this.showForm = false;
    this.selectedTask = undefined;
    this.errorMessage = '';
  }

  getPriorityClass(priority: Task['priority']): string {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  }

  getStatusClass(status: Task['status']): string {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }
}
