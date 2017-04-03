import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Transformer} from "../../classes/Transformer";

@Component({
  selector: 'transformer-property-selector',
  templateUrl: './transformer-property-selector.component.html',
  styleUrls: ['./transformer-property-selector.component.css']
})
export class TransformerPropertySelectorComponent implements OnInit {
  readonly nativeElement;

  @Input()
  transformer: Transformer;

  constructor(myElement: ElementRef) {
    this.nativeElement = myElement;
  }

  ngOnInit() { }
}
