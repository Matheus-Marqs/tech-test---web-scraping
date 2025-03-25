import fetch from 'node-fetch';
import fs from 'fs';

class CarrefourScraper {
    constructor(){
        this.baseUrl = 'https://mercado.carrefour.com.br/api/graphql';
        this.baseVariables = {
            isPharmacy: false,
            first: 100,
            sort: 'score_desc',
            term: '',
            selectedFacets: [
              { key: 'category-1', value: 'bebidas' },
              { key: 'category-1', value: '4599' },
              { key: 'channel', value: '{"salesChannel":2,"regionId":"v2.16805FBD22EC494F5D2BD799FE9F1FB7"}' },
              { key: 'locale', value: 'pt-BR' },
              { key: 'region-id', value: 'v2.16805FBD22EC494F5D2BD799FE9F1FB7' }
            ]
          };
    }

    buildUrl(variables){
        const encoded = encodeURIComponent(JSON.stringify(variables));
        return `${this.baseUrl}?operationName=ProductsQuery&variables=${encoded}`;
    }

    async getTotalCount(){
        const variables = { ...this.baseVariables, first: 1, after: "0" };
        const response = await fetch(this.buildUrl(variables));
        const data = await response.json();
        return data?.data?.search?.products?.pageInfo?.totalCount;
    }

    async test(){
        const totalCount = await this.getTotalCount();
        console.log(totalCount);
    }
}

(async () => {
    const scraper = new CarrefourScraper();
    await scraper.test();
})();