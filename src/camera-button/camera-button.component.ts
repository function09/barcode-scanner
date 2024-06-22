import { Component } from '@angular/core';
import * as SDCCore from 'scandit-web-datacapture-core';
import {
  IdCapture,
  IdCaptureOverlay,
  IdCaptureSettings,
  IdDocumentType,
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

  async enableIdScanning() {
    try {
      const UI = new SDCCore.DataCaptureView();

      UI.connectToElement(document.getElementById('cameraUI')!);
      UI.showProgressBar();
      UI.setProgressBarMessage('Loading...');

      // Configuration
      await SDCCore.configure({
        licenseKey:
          'AiSUXik0DPfoP6i7ERgfMIozinACOSIg6R6JddMIozkPWVyAp0lhN/5GVONobFbJ9xnah3pzGxkWD2L02Vi2SDdbHOC/Tv9YZ3NysSMqAY6xMCEw6i06PjgNWVs3YsXbVVgHFxZtKnH1c5wWyVtuJmx9vMIiULeChGqbtbwXLtXyckSxDHfjXwdGdbTbVkk4ICA6gmNLHgIVUg8YxkPPFipBGwEkSueeS1LS3qAQQptrfBERghcr/KNficWPfxRLRGpGVa5dtrcTTIj1GGuv4cVUakATamueGHRSJkkWlx4WfRXRDk1nJMprgTmwR594eUNYLZJbJGnWWudkjXSCUDV5By62WnUSfmWU2z5dvWMTeRZgFFH11zw4hZvSZuIVxAjCt9VD1vaOXc7WpwOYffd7ZKiVZ4+OxQ5DXFhpMyRNVxkul176WBA0AkrBLqP7MWTPWMUUZrp1XsPok3crZ75/YWLff00Fe0zGNj90Ta+jSydsUHJK+OlgDWBzEUATlG4s+DNG9QDpTTLW9hfriYEo3lYbSZcbe2G4H8UE/5n/aS0rgbcM7uOETw2z8zmQMkI/42NsHmU6lHJLjC0hFjw3FLtMHIhi8UO0CmL/YbaE9Qn1R+zbr3GR569uZRgB53Y/LalWccS+3VKPwdoPNUwWkP+QTTEaV8KxItBsmW0akcxDa501+LimW8mmwAzl5vtbozY8giHhwG3FbRnnZWxegc6IbJX2YeyiQfkbEhIp3k6EDtpqO5JESbWf9iJqkoeJy3NUc2hV4CY6thG7JI1ZX+M58Guxh/IKjDDr/UTXlo05GvECCWbbHcdTV4bYPn1bNFR0PPIVGj0FWPunF/ehmklHaSHbkRCR02hajVQbxv3ZQ0si5h96psdRdlufKAte2i38bMlR4AMkzxteyGBfnyT2cbvG6S+QBmG5t6EOj/GVBphHDgk0tM1FBE/GohjlvOzL20Hf/mthLXLkggawnD0WJVy7yNjd4pcQ7pZiaZiCVBCL8gIF/buDbagRIZ1WlQO6Cnb6Q8Dq54DHXHJFeoC/7bOR5wUTCmMSK1FERBBFFSdHB8/LXXPnGKXHEx+nYqzWDkN8jDbUil5LXYwIPqV48EqIabIKXrqhztMOhtEpYDIHcM2evRsDW+qT4hb53zHRLCB5WxvL0Yr+OAkMjcimEMBKtVbjO4EdAF2Kt1NWSr+IJt1b5a34KPaTRtc=',
        libraryLocation:
          'https://cdn.jsdelivr.net/npm/scandit-web-datacapture-id@6.x/build/engine/',
        moduleLoaders: [idCaptureLoader({ enableVIZDocuments: true })],
      });
      console.log('configuration works!');

      UI.hideProgressBar();

      // Data Capture Context
      const context = await SDCCore.DataCaptureContext.create();
      await UI.setContext(context);
      console.log('context info: ', context);

      // Camera setup
      const camera = SDCCore.Camera.default;
      await context.setFrameSource(camera);
      console.log('camera info:', camera);

      // const cameraSettings = new SDCCore.CameraSettings();
      // console.log('camera settings: ', cameraSettings);

      // ID Capture Settings
      const settings = new IdCaptureSettings();
      settings.supportedDocuments = [IdDocumentType.DLVIZ];
      settings.supportedSides = SupportedSides.FrontAndBack;
      console.log('IDCapture Settings: ', settings);

      // Listener
      const idCapture = await IdCapture.forContext(context, settings);
      await idCapture.setEnabled(false);

      const listener = {
        didCaptureId: (idCapture: any, session: any) => {
          if (session.newlyCapturedId.aamvaBarcodeResult != null) {
            console.log('ID captured: ', session.newlyCapturedId);
          }
        },
        didFailWithError: (idCapture: any, error: any, session: any) => {
          console.log('Capture failed:', error);
        },
      };
      console.log('listener: ', listener);

      idCapture.addListener(listener);

      // Capture View
      const view = await SDCCore.DataCaptureView.forContext(context);
      view.connectToElement(document.getElementById('cameraUI')!);

      let overlay = await IdCaptureOverlay.withIdCaptureForView(
        idCapture,
        view
      );

      console.log(overlay);

      // Turn on camera
      await camera.switchToDesiredState(SDCCore.FrameSourceState.On);
    } catch (error) {
      console.log('An error occured: ', error);
    }
  }
}
