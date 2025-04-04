import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  @Input() task?: Task;
  @Output() submitTask = new EventEmitter<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>();
  @Output() cancelEdit = new EventEmitter<void>();

  taskForm: FormGroup;
  priorities = ['low', 'medium', 'high'] as const;
  statuses = ['pending', 'in-progress', 'completed'] as const;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required],
      status: ['pending', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        dueDate: this.task.dueDate,
        priority: this.task.priority,
        status: this.task.status
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.submitTask.emit(this.taskForm.value);
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }
}
