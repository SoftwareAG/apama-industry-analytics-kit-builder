import { AnalyticsBuilderPage } from './app.po';

describe('analytics-builder App', function() {
  let page: AnalyticsBuilderPage;

  beforeEach(() => {
    page = new AnalyticsBuilderPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
