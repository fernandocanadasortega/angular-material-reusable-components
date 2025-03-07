import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'style-test',
  templateUrl: './style-test.component.html',
  styleUrls: ['./style-test.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StyleTestComponent {

  constructor() {  }
}
