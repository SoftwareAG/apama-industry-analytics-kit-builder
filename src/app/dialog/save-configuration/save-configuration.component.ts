import {Component, OnInit} from "@angular/core";
import {AbstractDataService} from "../../services/AbstractDataService";
import {FileService} from "../../services/FileService";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'save-configuration-dialog',
  templateUrl: './save-configuration.component.html',
  styleUrls: ['./save-configuration.component.css']
})
export class SaveConfigurationComponent implements OnInit {

  constructor(public dataService: AbstractDataService, public fileService: FileService, private activeModal: NgbActiveModal) { }

  saveConfig() {
    this.activeModal.close('SaveConfiguration');
    let saveFile = document.createElement("a");
    const config = this.dataService.hierarchy.getValue();

    try {
      const data = this.fileService.serialize(config);
      saveFile.href = "data:application/octet-stream," + encodeURI(data);
      saveFile.download = config.name.getValue().replace(/[ *]/g, "_") + ".evt";
      saveFile.click();
    }
    catch(error) {
      alert(error.message);
    }
  }

  close(result: any) {
    this.activeModal.close(result);
  }

  dismiss(reason: any) {
    this.activeModal.close(reason);
  }


ngOnInit() {
  }

}
