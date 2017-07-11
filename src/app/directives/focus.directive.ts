import {Directive, ElementRef, OnInit} from "@angular/core";

@Directive({
  selector: '[ab-autofocus]',
})
export class FocusDirective implements  OnInit {
  constructor(public elementRef: ElementRef) { }

  ngOnInit() {
    this.elementRef.nativeElement.focus();
  }
}
