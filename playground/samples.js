"use strict";
// Responses are illustrative, anonymized fixtures, not benchmarks.
const samples = [
 { id:"healthy",label:"Healthy bool · product search",
  query:{size:20,query:{bool:{must:[{match:{name:"running shoes"}}],filter:[{term:{"category.keyword":"footwear"}},{term:{in_stock:true}},{range:{price:{lte:150}}}]}}}},
 { id:"slow",label:"Costly patterns · wildcard + script",
  query:{from:10000,size:50,query:{bool:{must:[{wildcard:{"name.keyword":{value:"*shoe*"}}},{term:{"category.keyword":"footwear"}}],filter:[{script:{script:{source:"doc['price'].value * params.tax < params.max",params:{tax:1.2,max:150}}}}]}}}},
 { id:"score",label:"Score debugging · explain response",
  query:{size:10,query:{match:{name:{query:"running shoes",boost:2}}}},
  response:{explain:{_index:"products",_id:"product-7",matched:true,explanation:{value:2.4,description:"weight(name:running in 7) [PerFieldSimilarity], result of:",details:[{value:2.4,description:"score(freq=2.0), computed as boost * idf * tf from:",details:[{value:2,description:"boost",details:[]},{value:1.5,description:"idf, computed as log(1 + (N - n + 0.5) / (n + 0.5))",details:[]},{value:.8,description:"tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl))",details:[]}]}]}},validate:{valid:true,explanations:[{index:"products",valid:true,explanation:"name:running name:shoes"}]}}},
 { id:"profile",label:"Timing breakdown · profile response",
  query:{size:10,profile:true,query:{bool:{must:[{wildcard:{"name.keyword":"*shoe*"}}],filter:[{term:{in_stock:true}}]}}},
  response:{profile:{shards:[{id:"[sample-node][products][0]",searches:[{query:[{type:"BooleanQuery",description:"+name.keyword:*shoe* #in_stock:T",time_in_nanos:12000000,children:[{type:"MultiTermQueryConstantScoreWrapper",description:"name.keyword:*shoe*",time_in_nanos:10200000,children:[]},{type:"TermQuery",description:"in_stock:T",time_in_nanos:400000,children:[]}]}]}]},{id:"[sample-node][products][1]",searches:[{query:[{type:"BooleanQuery",description:"+name.keyword:*shoe* #in_stock:T",time_in_nanos:8000000,children:[{type:"MultiTermQueryConstantScoreWrapper",description:"name.keyword:*shoe*",time_in_nanos:6800000,children:[]}]}]}]}]}}}
];
