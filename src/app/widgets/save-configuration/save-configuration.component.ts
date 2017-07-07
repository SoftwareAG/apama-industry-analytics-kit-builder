import {Component} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {FileService} from "../../services/FileService";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'save-configuration-dialog',
  templateUrl: './save-configuration.component.html',
  styleUrls: ['./save-configuration.component.scss']
})
export class SaveConfigurationComponent {

  constructor(public dataService: AbstractDataService, public fileService: FileService, private activeModal: NgbActiveModal) { }

  saveConfig() {
    this.activeModal.close('SaveConfiguration');

    const config = this.dataService.hierarchy.getValue();
    const content = this.fileService.serializeConfig(config);
    const fileName = config.name.getValue().replace(/[ *]/g, "_") + ".evt";
    try {
      this.fileService.saveFile(fileName, content);
      this.dataService.setModified(false);
    } catch(error) {
      alert(error.message);
    }
  }

  close(result: any) {
    this.activeModal.close(result);
  }

  dismiss(reason: any) {
    this.activeModal.close(reason);
  }

}
