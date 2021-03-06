import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {Injectable} from "@angular/core";
import {AbstractDragService, Draggable, Dragged, Point} from "../../services/AbstractDragService";
import {DragOverlayComponent} from "./drag-overlay.component";
import * as d3 from "d3";
import {TestUtils} from "../../services/TestUtil.spec";
import {SelectionService} from "../../services/SelectionService";

@Injectable()
class DragServiceMock extends AbstractDragService {
  startDrag(draggable: Draggable) {
    this.dragging.next(new Dragged(draggable));
  }

  stopDrag() {
    const previous = this.dragging.getValue();
    this.dragging.next(undefined);
    return previous;
  }

  drag(newLocation: Point) {
    const dragging = this.dragging.getValue();
    dragging && dragging.currentLocation.next(newLocation);
  }
}

describe('DragOverlayComponent', () => {
  let component: DragOverlayComponent;
  let fixture: ComponentFixture<DragOverlayComponent>;
  let el: HTMLElement;
  let dragService: DragServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragOverlayComponent ],
      providers: [
        SelectionService,
        {provide: AbstractDragService, useClass: DragServiceMock}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    dragService = TestBed.get(AbstractDragService) as DragServiceMock;
    dragService.dragging.next(undefined);
    fixture = TestBed.createComponent(DragOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement.nativeElement;
  });

  it('should have an svg child element', () => {
    expect(el.children[0].nodeName).toEqual('svg');
  });

  it('should append a clone of the sourceElement when drag is started', () => {
    const svg = el.children[0];

    const testElement = TestUtils.withTempSvg().append('text')
      .classed('testElement', true)
      .text("HelloWorld")
      .node() as SVGTextElement;

    dragService.startDrag({sourceElement: testElement, object: undefined as any});
    fixture.detectChanges();

    const dragClone = svg.querySelector(".testElement");
    expect(dragClone).toBeTruthy();
    expect(d3.select(dragClone).text()).toEqual("HelloWorld");
  });

  it('should move the sourceElement clone when dragging', () => {
    const svg = el.children[0];

    const testElement = TestUtils.withTempSvg().append('circle')
      .classed('testElement', true)
      .attr('r', 10)
      .node() as SVGCircleElement;

    dragService.startDrag({sourceElement: testElement, object: undefined as any});
    fixture.detectChanges();

    dragService.drag({x: 100, y: 100});
    fixture.detectChanges();
    const dragClone = svg.querySelector(".testElement");
    expect(dragClone).toBeTruthy();
    expect(d3.select(dragClone).attr('transform')).toEqual("translate(100,100)");
  });

  it('should move the sourceElement clone when mouse is moved', () => {
    const svg = el.children[0];

    const testElement = TestUtils.withTempSvg().append('circle')
      .classed('testElement', true)
      .attr('r', 10)
      .node() as SVGCircleElement;

    dragService.startDrag({sourceElement: testElement, object: undefined as any});
    fixture.detectChanges();

    const evt = new MouseEvent("mousemove", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 200,
      clientY: 200
    });
    document.dispatchEvent(evt);
    fixture.detectChanges();

    const currentLocation = (dragService.dragging.getValue() as Dragged).currentLocation.getValue();
    expect(currentLocation.x).toEqual(200);
    expect(currentLocation.y).toEqual(200);

    const dragClone = svg.querySelector(".testElement");
    expect(dragClone).toBeTruthy();
    expect(d3.select(dragClone).attr('transform')).toEqual("translate(200,200)");
  });

  it('should remove sourceElement clone on dragStop', (done) => {
    const svg = el.children[0];

    const testElement = TestUtils.withTempSvg().append('circle')
      .classed('testElement', true)
      .attr('r', 10)
      .node() as SVGCircleElement;

    dragService.startDrag({sourceElement: testElement, object: undefined as any});
    fixture.detectChanges();

    expect(svg.querySelector(".testElement")).toBeTruthy();

    dragService.stopDrag();
    fixture.detectChanges();

    const intervalHandle = setInterval(() => {
      if (!svg.querySelector(".testElement")) {
        done();
        clearInterval(intervalHandle);
      }
    });
  });

  it('should drop the sourceElement clone when mouse is released', (done) => {
    const svg = el.children[0];

    const testElement = TestUtils.withTempSvg().append('circle')
      .classed('testElement', true)
      .attr('r', 10)
      .node() as SVGCircleElement;

    dragService.startDrag({sourceElement: testElement, object: undefined as any});
    fixture.detectChanges();

    expect(svg.querySelector(".testElement")).toBeTruthy();

    const evt = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window
    });
    document.dispatchEvent(evt);
    fixture.detectChanges();

    const intervalHandle = setInterval(() => {
      if (!svg.querySelector(".testElement")) {
        done();
        clearInterval(intervalHandle);
      }
    });
  });
});
