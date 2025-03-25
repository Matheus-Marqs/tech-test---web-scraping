import fetch from 'node-fetch';

const variables = {
    isPharmacy: false,
    first: 1,
    after: "0",
    sort: "score_desc",
    term: "",
    selectedFacets: [
      { key: "category-1", value: "bebidas" },
      { key: "category-1", value: "4599" },
      { key: "channel", value: "{\"salesChannel\":2,\"regionId\":\"v2.16805FBD22EC494F5D2BD799FE9F1FB7\"}" },
      { key: "locale", value: "pt-BR" },
      { key: "region-id", value: "v2.16805FBD22EC494F5D2BD799FE9F1FB7" }
    ]
  };

const queryUrl = `https://mercado.carrefour.com.br/api/graphql?operationName=ProductsQuery&variables=${encodeURIComponent(JSON.stringify(variables))}`;

async function getTotalCount(){
    try{
        const response = await fetch(queryUrl);
        const data = await response.json();

        const totalCount = data?.data?.search?.products?.pageInfo?.totalCount;

        return totalCount;
    }catch(error){
        console.error('Error fetching total count', error.message);
    }
}

const totalCount = await getTotalCount();
console.log(totalCount)