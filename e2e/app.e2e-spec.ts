import { IotBuilderPage } from './app.po';

describe('iot-builder App', () => {
  let page: IotBuilderPage;

  beforeEach(() => {
    page = new IotBuilderPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
