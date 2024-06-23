import { Component } from '@angular/core';
import * as SDCCore from 'scandit-web-datacapture-core';
import {
  IdCapture,
  IdCaptureOverlay,
  IdCaptureSettings,
  IdDocumentType,
  IdImageType,
  SupportedSides,
  idCaptureLoader,
} from 'scandit-web-datacapture-id';

@Component({
  selector: 'app-camera-button',
  standalone: true,
  imports: [],
  templateUrl: './camera-button.component.html',
  styleUrl: './camera-button.component.css',
})
export class CameraButtonComponent {
  buttonName = 'Activate camera';
  firstName = '';
  lastName = '';
  fullName = '';
  sex = '';
  documentNumber: any;
  age: any;
  address = '';
  async enableIdScanning() {
    try {
      // For visualizing process
      const view = new SDCCore.DataCaptureView();

      // Bind to HTML element
      view.connectToElement(document.getElementById('cameraUI')!);

      // Show loading status
      view.showProgressBar;

      // Configuration
      await SDCCore.configure({
        licenseKey:
          'AiSUXik0DPfoP6i7ERgfMIozinACOSIg6R6JddMIozkPWVyAp0lhN/5GVONobFbJ9xnah3pzGxkWD2L02Vi2SDdbHOC/Tv9YZ3NysSMqAY6xMCEw6i06PjgNWVs3YsXbVVgHFxZtKnH1c5wWyVtuJmx9vMIiULeChGqbtbwXLtXyckSxDHfjXwdGdbTbVkk4ICA6gmNLHgIVUg8YxkPPFipBGwEkSueeS1LS3qAQQptrfBERghcr/KNficWPfxRLRGpGVa5dtrcTTIj1GGuv4cVUakATamueGHRSJkkWlx4WfRXRDk1nJMprgTmwR594eUNYLZJbJGnWWudkjXSCUDV5By62WnUSfmWU2z5dvWMTeRZgFFH11zw4hZvSZuIVxAjCt9VD1vaOXc7WpwOYffd7ZKiVZ4+OxQ5DXFhpMyRNVxkul176WBA0AkrBLqP7MWTPWMUUZrp1XsPok3crZ75/YWLff00Fe0zGNj90Ta+jSydsUHJK+OlgDWBzEUATlG4s+DNG9QDpTTLW9hfriYEo3lYbSZcbe2G4H8UE/5n/aS0rgbcM7uOETw2z8zmQMkI/42NsHmU6lHJLjC0hFjw3FLtMHIhi8UO0CmL/YbaE9Qn1R+zbr3GR569uZRgB53Y/LalWccS+3VKPwdoPNUwWkP+QTTEaV8KxItBsmW0akcxDa501+LimW8mmwAzl5vtbozY8giHhwG3FbRnnZWxegc6IbJX2YeyiQfkbEhIp3k6EDtpqO5JESbWf9iJqkoeJy3NUc2hV4CY6thG7JI1ZX+M58Guxh/IKjDDr/UTXlo05GvECCWbbHcdTV4bYPn1bNFR0PPIVGj0FWPunF/ehmklHaSHbkRCR02hajVQbxv3ZQ0si5h96psdRdlufKAte2i38bMlR4AMkzxteyGBfnyT2cbvG6S+QBmG5t6EOj/GVBphHDgk0tM1FBE/GohjlvOzL20Hf/mthLXLkggawnD0WJVy7yNjd4pcQ7pZiaZiCVBCL8gIF/buDbagRIZ1WlQO6Cnb6Q8Dq54DHXHJFeoC/7bOR5wUTCmMSK1FERBBFFSdHB8/LXXPnGKXHEx+nYqzWDkN8jDbUil5LXYwIPqV48EqIabIKXrqhztMOhtEpYDIHcM2evRsDW+qT4hb53zHRLCB5WxvL0Yr+OAkMjcimEMBKtVbjO4EdAF2Kt1NWSr+IJt1b5a34KPaTRtc=',
        libraryLocation:
          'https://cdn.jsdelivr.net/npm/scandit-web-datacapture-id@6.x/build/engine/',
        moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
      });
      console.log('configuration works!');

      // Hide progress bar
      view.hideProgressBar();

      // Create context
      const context = await SDCCore.DataCaptureContext.create();

      // set default camera
      const camera = SDCCore.Camera.default;

      await camera.applySettings(IdCapture.recommendedCameraSettings);
      await context.setFrameSource(camera);

      await view.setContext(context);

      view.addControl(new SDCCore.CameraSwitchControl());

      // Create the IdCapture settings needed
      const settings = new IdCaptureSettings();
      settings.supportedDocuments = [
        IdDocumentType.DLVIZ,
        IdDocumentType.IdCardVIZ,
      ];
      settings.setShouldPassImageTypeToResult(IdImageType.Face, true);

      //Create the IdCapture mode with the new settings
      const idCapture = await IdCapture.forContext(context, settings);

      // Setup the listener to get notified about results
      idCapture.addListener({
        didCaptureId: async (idCaptureInstance: IdCapture, session) => {
          // Disable the IdCapture mode to handle the current result
          await idCapture.setEnabled(false);

          const capturedId = session.newlyCapturedId!;

          this.firstName = capturedId.firstName!;
          this.lastName = capturedId.lastName!;
          this.documentNumber = capturedId.documentNumber;
          this.age = capturedId.age!;
          this.sex = capturedId.sex!;
          this.address = capturedId.address!;

          // Turn off camera if successful capture
          await idCapture.setEnabled(false);
        },
        didRejectId: async () => {
          await idCapture.setEnabled(false);
          console.log('Document type not supported.');
        },
      });

      // Apply new overlay for newly created IdCapture mode
      await IdCaptureOverlay.withIdCaptureForView(idCapture, view);

      // Disable IdCapture until camera is accessed
      await idCapture.setEnabled(false);

      // Finally, switch on camera
      await camera.switchToDesiredState(SDCCore.FrameSourceState.On);
      await idCapture.setEnabled(true);
    } catch (error) {
      console.log('An error occured: ', error);
    }
  }
}
