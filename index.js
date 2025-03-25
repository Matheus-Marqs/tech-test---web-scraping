import fetch from "node-fetch";
import fs from "fs/promises";

class CarrefourScraper {
  constructor() {
    this.baseUrl = "https://mercado.carrefour.com.br/api/graphql";
    this.baseVariables = {
      isPharmacy: false,
      first: 100,
      sort: "score_desc",
      term: "",
      selectedFacets: [
        { key: "category-1", value: "bebidas" },
        { key: "category-1", value: "4599" },
        {
          key: "channel",
          value: '{"salesChannel":2,"regionId":"v2.16805FBD22EC494F5D2BD799FE9F1FB7"}',
        },
        { key: "locale", value: "pt-BR" },
        { key: "region-id", value: "v2.16805FBD22EC494F5D2BD799FE9F1FB7" }, //Com esse regionId, é possível filtrar exclusivamente a loja localizada em Piracicaba
      ],
    };
  }

  async clearOutputFile() {
    try {
      await fs.access('./output.json');
      await fs.unlink('./output.json');

      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Erro ao tentar remover output.js:", error);
      }
    }
  }

  buildUrl(variables) {
    const encoded = encodeURIComponent(JSON.stringify(variables));
    return `${this.baseUrl}?operationName=ProductsQuery&variables=${encoded}`;
  }

  async getTotalCount() {
    const variables = { ...this.baseVariables, first: 1, after: "0" };
    const response = await fetch(this.buildUrl(variables));
    const data = await response.json();
    return data?.data?.search?.products?.pageInfo?.totalCount;
  }

  async fetchProducts(after) {
    console.log('Scraping items...');

    const variables = { ...this.baseVariables, after: after.toString() };
    const response = await fetch(this.buildUrl(variables));
    const json = await response.json();

    const edges = json?.data?.search?.products?.edges || [];
    return edges.map(edge => {
        const node = edge.node;
        return {
            name: node.name,
            currentPrice: node.offers?.lowPrice ?? null,
            lastPrice: node.offers?.offers?.[0]?.listPrice ?? null,
        };
    });
  }

  async scrapeAllProducts() {
    const totalCount = await this.getTotalCount();
    const limit = 100;
    let allProducts = [];

    console.log(`Total de produtos: ${totalCount}`);

    for (let i = 0; i < totalCount; i += limit) {
      const products = await this.fetchProducts(i);
      allProducts.push(...products);
    }

    return allProducts;
  }

  saveToFile(data, filename = "output.json") {
    fs.writeFile(filename, JSON.stringify(data, null, 2));
  }
}

(async () => {
  const scraper = new CarrefourScraper();
  await scraper.clearOutputFile();
  const products = await scraper.scrapeAllProducts();
  scraper.saveToFile(products);
})();
