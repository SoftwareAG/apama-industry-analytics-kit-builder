import {Component, ElementRef, OnInit} from '@angular/core';
import {Property} from "../../classes/Property";
import {AbstractTransformerPropertyService} from "../../services/AbstractTransformerPropertyService";

@Component({
  selector: 'transformer-property-selector',
  templateUrl: './transformer-property-selector.component.html',
  styleUrls: ['./transformer-property-selector.component.css']
})
export class TransformerPropertySelectorComponent implements OnInit {
  readonly nativeElement;
  readonly transformerPropertyService;

  transformerProperties;

  constructor(myElement: ElementRef, transformerPropertyService: AbstractTransformerPropertyService) {
    this.nativeElement = myElement;
    this.transformerPropertyService = transformerPropertyService;
  }

  ngOnInit() {
    this.transformerPropertyService.withTransformerProperties( (transformerProperties: Property[]) => {
      this.transformerProperties = transformerProperties;
    });
  }
}
