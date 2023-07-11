import {Component, inject, Signal} from '@angular/core';
import {AsyncPipe, NgFor} from '@angular/common';
import {ToDo} from "@dagger-ui-test/shared";
import {ToDoService} from "./to-do.service";

@Component({
  selector: 'dagger-ui-test-root',
  template: `
    <h1>Testing Dagger with Nx Mono Repo</h1>
    <ul>
      <li *ngFor="let toDo of toDos()">{{toDo.name}}</li>
    </ul>

  `,
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgFor, AsyncPipe],
})
export class AppComponent {
  toDos: Signal<ToDo[]> = inject(ToDoService).getToDos();
}
