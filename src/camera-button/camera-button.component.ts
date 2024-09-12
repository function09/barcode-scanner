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
      view.showProgressBar();

      // Configuration
      await SDCCore.configure({
        licenseKey:
          'AnUlJAZZI6D8CuynMQB+2R8ub58lCtU2yitajA8PL4fuaAp0d2SkOgZW6vefYn+hhhePa0I0pp2vR1sEaiFYI69Scu/ReVcGpUVWYFE1w6xlGjWpxyRXg3kuqAMzV7EJQkCw/KhgRFx+VrfFq1C8naNQE6AsecmV2w+kz4lpa5IRZhcMWm0DaINGeRpLVZl5iVgmzERbWQPSJNiuE0LKWZVn9KK2ReXwt3QOFr18HzzZbJNIcUKYgs50VMu+F7WQyWh7324Q5gAbFoBoqkrdvtho1yoydHpdMFDq50tZFQr8TB8n0HI5hk1QZn0lFNr3P25uSSp9HPQmcbERbVw8D2VQkqO0fi7IvxDozLF1DavYGMSjvgXaz1Im8rSDO2AhwV87VzRmyuYwaBeysEZQSXpMSjLFXGYmdhaKmE5SGkEXT3s8yDXNHgQmhPSdcdH3qn1tJyVqAnIyG9H6wz5kcj8TaTeZSDRL7CyIRWRq86yRcam5rxye3Hh1ui08Zx8EjXOs0fRsm7rbYFHu8EDNMPQ5CGOUmUm+J08dnpWluw95WDFFXC6heeu6If5PHsyT3FPyT/TbcFlu91DsLtEENTBtdw+6OuEMxCLCEKLjExJLC9uOcES8OphlVxeNYDG5SiHQvu7HnDIHgPrph36Ae1zE9GM6eAX9kqqftGn4l5QZ3jlDDCeEMyd/klQyofJGeC4E6X9aLqwTYroeyXcyFC6UbEuM8G70Q5MgsjV5UWnqvq30c85TfH0gviflkCpfhKWRAYZD+dTrbsDqC2TldTUFXuqcBlgd6WEIfdLtWUOZioUeSQgB349+sYIIdLIQ9lKZgT086MYiPzoHJ5C+N2Q27Yf5ZpX2/2IPdIeYmo4txQ7kOP5Fa5/nDsodFvm3nDpaNckW3bPd81i4IZAp8a1OrnOzy/42PpwOJ9iM16iT6vw2O+dAbkbn1kcoLukUS9+UOlGyhQ9bgDQiOrEx4OFd58PEQ2szArGJE9YMJN90Bkx6bOOfjLW2Gc0HVgHpXjyfTQ0Sg/TV5YCtZPPp16TerJO6hcXTVTITNG9hbPdw/xeKC6LZhFgOSSjmbP7vXIMsc10c/IOaYSnH9Zg1QM8L/AePW0mTAiRoq9gK1c+ACpekctanCyhGjSGvWpXB0ndHMjm1wn1RmO5D+J6Wmo58b540T0tDIg4zEQU156g1ZNUGUsoXTDua2IUmPHRJLI0=',
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

      // Create the IdCapture mode with the new settings
      const idCapture = await IdCapture.forContext(context, settings);

      // Setup the listener to get notified about results
      idCapture.addListener({
        didCaptureId: async (idCaptureInstance: IdCapture, session) => {
          // Disable the IdCapture mode to handle the current result
          await idCapture.setEnabled(false);

          // Turn off camera if successful capture
          await camera.switchToDesiredState(SDCCore.FrameSourceState.Off);

          const capturedId = session.newlyCapturedId!;

          view.detachFromElement();
          this.firstName = capturedId.firstName!;
          this.lastName = capturedId.lastName!;
          this.documentNumber = capturedId.documentNumber;
          this.age = capturedId.age!;
          this.sex = capturedId.sex!;
          this.address = capturedId.address!;
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
