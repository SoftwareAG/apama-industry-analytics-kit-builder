import {TestBed} from "@angular/core/testing";
import {AbstractDataService} from "./AbstractDataService";
import {HistoryService} from "./HistoryService";
import {DataService} from "./DataService";
import {TransformerBuilder} from "../classes/Transformer";

describe('HistoryService', () => {
  let dataService: DataService;
  let historyService: HistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HistoryService,
        {provide: AbstractDataService, useClass: DataService}
     ]
    });
    dataService = TestBed.get(AbstractDataService) as DataService;
    historyService = TestBed.get(HistoryService);
  });

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should initialise as canUndo to false, canRedo to false', () => {
    historyService.canUndo().subscribe(result => expect(result).toBeFalse());
    historyService.canRedo().subscribe(result => expect(result).toBeFalse());
  });

  it('should return canUndo to true, canRedo to false when one analytic is added', () => {
    dataService.hierarchy.getValue().addRow(new TransformerBuilder().Name('Analytic1').build());
    jasmine.clock().tick(500);
    historyService.canUndo().subscribe(result => expect(result).toBeTrue());
    historyService.canRedo().subscribe(result => expect(result).toBeFalse());
  });

  it('should return canUndo to false, canRedo to true when one analytic is added and then undone', () => {
    dataService.hierarchy.getValue().addRow(new TransformerBuilder().Name('Analytic1').build());
    jasmine.clock().tick(500);
    historyService.undo();
    jasmine.clock().tick(500);
    historyService.canUndo().subscribe(result => expect(result).toBeFalse());
    historyService.canRedo().subscribe(result => expect(result).toBeTrue());
  });

  it('should return canUndo to true, canRedo to false when one analytic is added, undone and redone', () => {
    dataService.hierarchy.getValue().addRow(new TransformerBuilder().Name('Analytic1').build());
    jasmine.clock().tick(500);
    historyService.undo();
    jasmine.clock().tick(500);
    historyService.redo();
    jasmine.clock().tick(500);
    historyService.canUndo().subscribe(result => expect(result).toBeTrue());
    historyService.canRedo().subscribe(result => expect(result).toBeFalse());
  });

  it('should return canUndo to true, canRedo to true when two analytics are added and one is undone', () => {
    dataService.hierarchy.getValue().addRow(new TransformerBuilder().Name('Analytic1').build());
    jasmine.clock().tick(500);
    dataService.hierarchy.getValue().addRow(new TransformerBuilder().Name('Analytic2').build());
    historyService.undo();
    jasmine.clock().tick(500);
    historyService.canUndo().subscribe(result => expect(result).toBeTrue());
    historyService.canRedo().subscribe(result => expect(result).toBeTrue());
  });
});
