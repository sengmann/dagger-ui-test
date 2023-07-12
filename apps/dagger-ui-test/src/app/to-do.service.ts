import {computed, Injectable, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ToDo} from "@dagger-ui-test/shared";

@Injectable({
  providedIn: 'root'
})
export class ToDoService {

  #toDos = signal<ToDo[]>([])
  hasLoaded = false;

  constructor(private httpClient: HttpClient) {
  }

  getToDos() {
    if (this.hasLoaded === false) {
      this.httpClient.get<ToDo[]>('dagger-ui-backend/todo').subscribe(result => {
        this.#toDos.set(result)
        this.hasLoaded = true
      })
    }
    return computed(() => this.#toDos());
  }
}
