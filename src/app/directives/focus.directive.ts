import {Directive, ElementRef, OnInit} from "@angular/core";

@Directive({
  selector: '[focus]',
})
export class FocusDirective implements  OnInit {
  constructor(public elementRef: ElementRef) { }

  ngOnInit() {
    this.elementRef.nativeElement.focus();
  }
}
