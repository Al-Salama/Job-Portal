"use strict";(self.webpackChunkadmin_site=self.webpackChunkadmin_site||[]).push([[829],{829:function(e,t,n){n.r(t),n.d(t,{default:function(){return p}});var s=n(165),i=n(861),a=n(683),r=n(439),c=n(791),l="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAABU0lEQVQ4EdWUvy4EURTGz64VyXYqBcVqRbPxBEQhWo1Eo+IFSLbUeAMPoKPRikJHKxreAC0KEvH3962dNefu2ZmJaEy+3z333PPdM7N3dtfsj69ahX6LeMZBumc4haGKGo7hXoFZGIV1M2uA9Mawb2avcAVH8AJ9pQ1HqJzAHFzCB0Sqs9iGC1iCdwi1zeoDtKz8apmZvFvEUJusfv6SDfZ1lZ2NkgOGGViFZaiiY0yHoL2EQS2wpIPXWTItlB5G3vm8q55PmN+Cmk0QyySPvNrT96YNb3qVqV4sCpkn29P1pg2fWH2ESSiTPHrLz3lj2lA13VFmzYuQR17niRrqTGR2xiCRR15XGtYwOx9nThJ5KjXUx9Ddk/0DqTzyukL0hHc4dHdCoeSR15kaLvtOzgl7sGNm1xBJ/0TTFM7Aqeayn2SNaQeaEElflV0K+tkR/pO+AOvGPZ58uIThAAAAAElFTkSuQmCC",o="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAABhklEQVQ4Eb2UwUoCURSGb5aLSMhSoZIeIIt2rTKJtvUMtVZa9gxBZhAEbW3dut6kLHSdJRYtisQMp++3GWMctZmIhv87/z3n3nPHO8xozB9fIz/sF2I+BQmQ6oQStCGQplhdgBpY8GKjsWqH5FHwpQyr1FTGsxADR3EGOajAA6RhqDaYbUIeRmGQxpjQCbR23Qy4dPcn5o6gVxEKAnPpmOwRpsGjAyq3oLtjLp2SCcylMJmOv493FOpEY+TbjAvwAb0apyAwl1pk6tnBtUdnI8ZmiTADlxBUFzTMwQIY53hJkje4B2mCcAIRkFYU4BykV8IuqOcOb8A8XDsbMvZIi1p29d32Z9tVdz4KubCnvmwZs2AW+qlIUWAeJalYsAjdZ3hFohd1Ew+qLRqqcAPdDdskZ8aYPej3GBrUBeZSmEw9RVx7YN+KMtSvDPpi69dN0ttXa1SbkAe/n94qa4cqw2wNypCFGDiKM8hBBXSaNO5Lv/778rw/PbfT55SilgCpTihBG/5Hn2H1UIu/rADTAAAAAElFTkSuQmCC",d=n(962),u=n(540),A=n(184),h={};function p(){var e=(0,c.useState)({isAdding:!1,list:[]}),t=(0,r.Z)(e,2),n=t[0],s=t[1];return h.get=n,(0,c.useEffect)((function(){h.set||(h.set=s),function(){k.apply(this,arguments)}()}),[]),(0,A.jsx)("main",{className:"Settings",children:(0,A.jsxs)("section",{className:"setting-sec",children:[(0,A.jsxs)("div",{className:"setting-header",children:[(0,A.jsx)("h3",{children:"\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629"}),(0,A.jsx)("span",{className:"add-item",children:(0,A.jsx)("button",{className:"add-item-btn",type:"button",onClick:function(e){f.call(this,e)},style:{backgroundImage:"url(".concat(o,")")}})})]}),(0,A.jsx)("div",{className:"setting-body",children:(0,A.jsx)("div",{className:"setting",children:m()})})]})})}function m(){if(h.get)return h.get.isAdding?(0,A.jsxs)(A.Fragment,{children:[(0,A.jsxs)("div",{children:[(0,A.jsx)("label",{htmlFor:"location-name",children:"\u0625\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639"}),(0,A.jsx)("input",{type:"text",id:"location-name"})]}),(0,A.jsxs)("div",{children:[(0,A.jsx)("label",{htmlFor:"location-url",children:"\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639"}),(0,A.jsx)("input",{type:"url",name:"locationUrl",id:"location-url"})]}),(0,A.jsxs)("div",{style:{display:"flex",justifyContent:"center"},children:[(0,A.jsxs)("button",{className:"form-button",id:"location-save-btn",onClick:function(e){v.call(this,e)},children:[(0,A.jsx)("span",{children:"\u062d\u0641\u0638"}),(0,A.jsx)("span",{className:"loading-spinner-button",role:"status","aria-hidden":"true"})]}),(0,A.jsx)("button",{className:"form-button",id:"location-cancel-btn",onClick:function(e){x.call(this,e)},children:(0,A.jsx)("span",{children:"\u0625\u0644\u063a\u0627\u0621"})})]})]}):h.get.list.map((function(e,t){return(0,A.jsxs)("div",{className:"location-item","data-id":e.id,children:[(0,A.jsxs)("div",{className:"item-info",children:[(0,A.jsx)("div",{className:"item-info-line",children:(0,A.jsxs)("p",{children:[(0,A.jsx)("b",{children:"\u0625\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639: "}),(0,A.jsx)("p",{children:e.name})]})}),(0,A.jsx)("div",{className:"item-info-line",children:(0,A.jsxs)("p",{children:[(0,A.jsx)("b",{children:"\u0627\u0644\u0631\u0627\u0628\u0637: "}),(0,A.jsx)("a",{href:e.url,target:"_blank",rel:"noopener noreferrer",children:e.url})]})})]}),(0,A.jsx)("div",{className:"controls",children:(0,A.jsx)("div",{className:"delete-item",children:(0,A.jsx)("button",{className:"delete-item-btn",type:"button",onClick:function(e){g.call(this,e)},style:{backgroundImage:"url(".concat(l,")")}})})})]},e.id)}))}function f(e){var t;null!==(t=h.get)&&void 0!==t&&t.isAdding||h.set((function(e){return(0,a.Z)((0,a.Z)({},e),{},{isAdding:!0})}))}function x(e){h.set((function(e){return(0,a.Z)((0,a.Z)({},e),{},{isAdding:!1})}))}function g(e){return b.apply(this,arguments)}function b(){return(b=(0,i.Z)((0,s.Z)().mark((function e(t){var n,i,a,r,c,l;return(0,s.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=t.target.parentElement.parentElement.parentElement,"string"===typeof(i=n.dataset.id)){e.next=4;break}return e.abrupt("return");case 4:return t.target.disabled=!0,r="".concat(d.Z.api,"/settings/locations/").concat(i),c=JSON.stringify({csrfToken:(0,u.v)("csrfToken")}),e.prev=7,e.next=10,fetch(r,{method:"DELETE",credentials:"include",body:c,headers:{"Content-Type":"application/json"}});case 10:a=e.sent,e.next=16;break;case 13:e.prev=13,e.t0=e.catch(7),console.error(e.t0);case 16:if(e.prev=16,!a){e.next=22;break}return e.next=20,a.json();case 20:l=e.sent,a.ok&&h.set({isAdding:!1,list:l.locations});case 22:return t.target.disabled=!1,e.finish(16);case 24:case"end":return e.stop()}}),e,null,[[7,13,16,24]])})))).apply(this,arguments)}function v(e){return j.apply(this,arguments)}function j(){return(j=(0,i.Z)((0,s.Z)().mark((function e(t){var n,i,a,r,c,l;return(0,s.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=document.getElementById("location-name").value,i=document.getElementById("location-url").value,t.target.disabled=!0,!(n.length>0&&i.length>0)){e.next=23;break}return r="".concat(d.Z.api,"/settings/locations"),c=JSON.stringify({csrfToken:(0,u.v)("csrfToken"),name:n,url:i}),e.prev=6,e.next=9,fetch(r,{method:"POST",credentials:"include",body:c,headers:{"Content-Type":"application/json"}});case 9:a=e.sent,e.next=15;break;case 12:e.prev=12,e.t0=e.catch(6),console.error(e.t0);case 15:if(e.prev=15,!a){e.next=21;break}return e.next=19,a.json();case 19:l=e.sent,a.ok&&h.set({isAdding:!1,list:l.locations});case 21:return t.target.disabled=!1,e.finish(15);case 23:case"end":return e.stop()}}),e,null,[[6,12,15,23]])})))).apply(this,arguments)}function k(){return(k=(0,i.Z)((0,s.Z)().mark((function e(){var t,n,i;return(0,s.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n="".concat(d.Z.api,"/settings"),e.prev=1,e.next=4,fetch(n,{method:"GET",credentials:"include"});case 4:t=e.sent,e.next=10;break;case 7:e.prev=7,e.t0=e.catch(1),console.error(e.t0);case 10:if(e.prev=10,!t){e.next=16;break}return e.next=14,t.json();case 14:i=e.sent,t.ok&&h.set({isAdding:!1,list:i.settings.locations});case 16:return e.finish(10);case 17:case"end":return e.stop()}}),e,null,[[1,7,10,17]])})))).apply(this,arguments)}}}]);
//# sourceMappingURL=829.945569cf.chunk.js.map