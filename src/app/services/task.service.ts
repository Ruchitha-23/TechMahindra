import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Task } from '../models/task';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly STORAGE_KEY = 'taskmanager_tasks';

  constructor(private authService: AuthService) {}

  private getTasks(): Task[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const tasksStr = localStorage.getItem(this.STORAGE_KEY);
      if (tasksStr) {
        return JSON.parse(tasksStr);
      }
    }
    return [];
  }

  private saveTasks(tasks: Task[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    }
  }

  getTasksForCurrentUser(): Observable<Task[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of([]);
    }

    const allTasks = this.getTasks();
    const userTasks = allTasks.filter(task => task.userId === currentUser.id);
    return of(userTasks);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Observable<Task> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser.id
    };

    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    return of(newTask);
  }

  updateTask(task: Task): Observable<Task> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id && t.userId === currentUser.id);
    
    if (index === -1) {
      return throwError(() => new Error('Task not found'));
    }

    tasks[index] = {
      ...task,
      updatedAt: new Date().toISOString()
    };
    
    this.saveTasks(tasks);
    return of(tasks[index]);
  }

  deleteTask(taskId: string): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === currentUser.id);
    
    if (taskIndex === -1) {
      return throwError(() => new Error('Task not found'));
    }

    const filteredTasks = tasks.filter(task => task.id !== taskId);
    this.saveTasks(filteredTasks);
    return of();
  }
}
