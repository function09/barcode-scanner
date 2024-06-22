import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraButtonComponent } from '../camera-button/camera-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CameraButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'barcode-scanner';
}
