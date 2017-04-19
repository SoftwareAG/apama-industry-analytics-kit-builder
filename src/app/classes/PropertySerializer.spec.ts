import {TransformerSerializer} from "app/classes/Transformer";
import {PropertyBuilder, PropertySerializer} from "./Property";
import {TestBed} from "@angular/core/testing";

describe('PropertySerializer', () => {

  let propertySerializer: PropertySerializer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransformerSerializer,
        PropertySerializer
      ]
    });
    propertySerializer = TestBed.get(PropertySerializer) as PropertySerializer;
  });

  it('should handle an empty Property', () => {
    const property = new PropertyBuilder()
      .build();

    const result = propertySerializer.toApama(property.toJson());
    expect(result).toBe('')
  });


});

