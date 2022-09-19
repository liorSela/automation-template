import { Browser } from '../utilities/browser';
import { Page } from './Pages/base/Page';
import config from '../../../server-side/config';

export class WebAppActivity extends Page {
    table: string[][] = [];
    constructor(protected browser: Browser, uuid: string) {
        super(browser, `${config.baseUrl}/activities/details/${uuid}`);
    }
}
