var map = L.map('map').setView([23.6, 121.041976], 7); //經緯度, zoom
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //maxZoom: 8,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.scale().addTo(map);

const regionSelect = document.getElementById('Region');
const caseSelect = document.getElementById('Case');
caseSelect.addEventListener('change',function(){
    initMAP();
        // new Promise(resolve => setTimeout(resolve, 100)); // 延遲 100 毫秒
    const selectedRegion = regionSelect.value;
    const selectedCase = caseSelect.value;
    fetch(`/spatial?region=${selectedRegion}&case=${selectedCase}`)
    .then(response => response.json())
    .then(data => {
        const resultRows = data.resultRows;
        const detailsData = data.detailsData;
        //將空間數據加到地圖
        resultRows.forEach((feature, index) => {
            // console.log("data: "+resultRows);
            // console.log(feature.geomjson);
            const geometry = JSON.parse(feature.geomjson);
            // console.log("index:"+index);
            // console.log("feature.caseseq: "+feature.caseseq);
            console.log("selectedCase: "+selectedCase);
            // console.log("detailsData[1].caseseq: "+detailsData[1].caseseq);
            // console.log("detailsData[2].caseseq: "+detailsData[2].caseseq);
            // console.log("detailsData[3].caseseq: "+detailsData[3].caseseq);
            let color;
            // 根據 case 設置不同的顏色
            if (feature.caseseq == selectedCase){
                color = 'red';
            }else if (feature.caseseq == detailsData[1].caseseq){
                color = 'orange';
            }else if (feature.caseseq == detailsData[2].caseseq){
                color = 'blue';
            }else if (feature.caseseq == detailsData[3].caseseq){
                color = 'green';
            }else {
                color = 'gray'; // 預設為灰色
                console.log("feature.caseseq: "+feature.caseseq);
            }
            
            L.geoJSON(geometry, {
                style: {
                    color: color,
                    weight: 2,
                    opacity: 1
                }
            }).addTo(map);
        });
    });
});

regionSelect.addEventListener('change',initMAP);

function initMAP() {
    // 清空地圖上的所有圖層
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });
}
/*
//動態變色
style: function (feature) {
    const category = feature.properties.category;
    let color;

    // 根據 category 設置不同的顏色
    if (category === 'A') {
        color = 'red';
    } else if (category === 'B') {
        color = 'blue';
    } else {
        color = 'green';
    }

    return {
        color: color,
        weight: 2,
        opacity: 0.5,
        fillOpacity: 0
    };
}
*/


//------------------舊方法KML------------------
/*
// Load kml file 主要事件
const select = document.getElementById("kmlFileSelect");

var baseMaps = {
    "OpenStreetMap": osm,
};
//初始化layerControl
var layerControl = L.control.layers(baseMaps).addTo(map);//https://leafletjs.com/examples/layers-control/
// 檢查layerControl裡面有什麼
// console.log("layerControl:"+layerControl); // [object Object]
// console.log("layerControl._layers:"+layerControl._layers); // [object Object]
// console.log("layerControl._layers.length:"+layerControl._layers.length); // 1
// console.log("layerControl._layers[0]:"+layerControl._layers[0]); // undefined
// console.log("layerControl._layers[0].length:"+layerControl._layers[0].length); // undefined

// console.log("layerControl Object: ");
// // 使用 Object.keys 取得物件的所有 key
// Object.keys(layerControl).forEach(key => {
//     console.log(`${key}:`, layerControl[key]);
// });

var kmlLayers0;
var kmlLayers1;
var kmlLayers2;
var kmlLayers3;
addEventListener("change", function (event) {
    const targetId = event.target.id;
    if (targetId === "Region" || targetId === "kmlFileSelect") {
        //清空地圖上的KML
        map.eachLayer(function (layer) {
            if (layer instanceof L.KML) { //判斷是否為KML圖層
                map.removeLayer(layer);
            }
        });

        //重置layerControl
        if (layerControl) {
            map.removeControl(layerControl);
            layerControl = L.control.layers(baseMaps).addTo(map);
            // console.log("重置 layerControl: ");
            // // 使用 Object.keys 取得物件的所有 key
            // Object.keys(layerControl).forEach(key => {
            //     console.log(`${key}:`, layerControl[key]);
            // });
        }

        //kmlFile0Name = select的選項名稱
        var kmlFile0Name = select.options[select.selectedIndex].text;

        if (event.target === select) { //如果是選擇kmlFileSelect
            //取得第一層 Region 的 value
            const selectregion = document.getElementById("Region");
            const selectedOption = selectregion.options[selectregion.selectedIndex];
            const selectedOptionValue = selectedOption.value;
            // console.log("selectedOptionValue from map: " + selectedOptionValue);
            let region; 
            switch (selectedOptionValue) {
                case "6300065000":
                    region = "Taipei";
                    // console.log("region是台北");
                    break;
                case "64000":
                    region = "Kaohsiung";
                    // console.log("region是高雄");
                    break;
                default:
                    region = null;
                    break;
            };

            //fetch('leaflet-kml-master/assets/Kaohsiung/1100731.kml')
            fetch('leaflet-kml-master/assets/' + region + '/' + select.value)
                .then(res => res.text())
                .then(kmltext => {
                    // Create new kml overlay
                    const parser = new DOMParser();
                    const kml = parser.parseFromString(kmltext, 'text/xml');
                    const track = new L.KML(kml);
                    map.addLayer(track);

                    // 將新的 KML 圖層加到 kmlLayers 中
                    kmlLayers0 = track;

                    // console.log("map-kmlLayers0:"+kmlLayers0);
                    layerControl.addOverlay(kmlLayers0, 'KML Layer Red: ' + kmlFile0Name);

                    // console.log("layerControl 一 一 一: ");
                    // // 使用 Object.keys 取得物件的所有 key
                    // Object.keys(layerControl).forEach(key => {
                    //     console.log(`${key}:`, layerControl[key]);
                    // });

                    // Adjust map to show the kml
                    const bounds = track.getBounds();
                    map.fitBounds(bounds);
                });


            let compareTOP3 = [];
            let kmlFile1, kmlFile2, kmlFile3;
            console.log("主事件 region: " + region);
            function handleDataUpdate(region) {
                console.log("進入handleDataUpdate");
                if (window.compare && window.compare.arrcase) {
                    //初始化compareTOP3
                    compareTOP3 = [];
                    compareTOP3 = window.compare.arrcase;
                    // console.log("map-top3:"+compareTOP3);

                    let json = window.load.data;
                    // console.log("map-json:" + json);

                    kmlFile1 = json[compareTOP3[0] - 1].kml;
                    kmlFile2 = json[compareTOP3[1] - 1].kml;
                    kmlFile3 = json[compareTOP3[2] - 1].kml;
                    // console.log("kmlFile1:" + kmlFile1);
                    // console.log("kmlFile2:" + kmlFile2);
                    // console.log("kmlFile3:" + kmlFile3);
                    var kmlFile1Name = json[compareTOP3[0] - 1].name;
                    var kmlFile2Name = json[compareTOP3[1] - 1].name;
                    var kmlFile3Name = json[compareTOP3[2] - 1].name;

                    // Load kml file 相似事件1
                    console.log("相似事件1 2 3 region: " + region);
                    fetch('leaflet-kml-master/assets/' + region + '/' + kmlFile1)
                        .then(res => res.text())
                        .then(kmltext => {
                            // console.log('KML data for 相似事件1:', kmltext);  // 檢查KML內容
                            // Create new kml overlay
                            const parser = new DOMParser();
                            const kml = parser.parseFromString(kmltext, 'text/xml');
                            const track = new L.KML(kml);
                            track.setStyle({ color: 'orange' });//改顏色
                            //track.setStyle({opacity: 0.5});//改透明度
                            map.addLayer(track);

                            // 將新的 KML 圖層加到 kmlLayers 中
                            kmlLayers1 = track;
                            // console.log("map-kmlLayers1:" + kmlLayers1); 
                            layerControl.addOverlay(kmlLayers1, 'KML Layer Orange: ' + kmlFile1Name); //加入layerControl

                            // Adjust map to show the kml
                            const bounds = track.getBounds();
                            map.fitBounds(bounds);
                        })

                    // Load kml file 相似事件2
                    fetch('leaflet-kml-master/assets/' + region + '/' + kmlFile2)
                        .then(res => res.text())
                        .then(kmltext => {
                            // Create new kml overlay
                            const parser = new DOMParser();
                            const kml = parser.parseFromString(kmltext, 'text/xml');
                            const track = new L.KML(kml);
                            track.setStyle({ color: 'blue' });//改顏色
                            map.addLayer(track);

                            // 將新的 KML 圖層加到 kmlLayers 中
                            kmlLayers2 = track;
                            // console.log("map-kmlLayers2:" + kmlLayers2);
                            layerControl.addOverlay(kmlLayers2, 'KML Layer Blue: ' + kmlFile2Name);

                            // Adjust map to show the kml
                            const bounds = track.getBounds();
                            map.fitBounds(bounds);
                        })

                    // Load kml file 相似事件3
                    fetch('leaflet-kml-master/assets/' + region + '/' + kmlFile3)
                        .then(res => res.text())
                        .then(kmltext => {
                            // Create new kml overlay
                            const parser = new DOMParser();
                            const kml = parser.parseFromString(kmltext, 'text/xml');
                            const track = new L.KML(kml);
                            track.setStyle({ color: 'green' });//改顏色
                            map.addLayer(track);

                            // 將新的 KML 圖層加到 kmlLayers 中
                            kmlLayers3 = track;
                            // console.log("map-kmlLayers3:" + kmlLayers3);
                            layerControl.addOverlay(kmlLayers3, 'KML Layer Green: ' + kmlFile3Name);

                            // Adjust map to show the kml
                            const bounds = track.getBounds();
                            map.fitBounds(bounds);
                        })
                };
                console.log("相似事件1 2 3 end");

            }

            // 確認監聽器是否已經被綁定，避免重複綁定
            if (!window.truefalse) {

                // 監聽自定義事件，當資料更新時執行相應的處理
                console.log("監聽 region: " + region);
                document.addEventListener('dataUpdated', function () {
                    // handleDataUpdate(region)包在function裡面，避免立刻執行，否則第一次執行會出錯
                    handleDataUpdate(region)
                }
                );

                // 最初加載時執行一次處理
                // handleDataUpdate(region);

                // 標記監聽器已經被綁定
                window.truefalse = true; // 這行會讓監聽器只執行一次

            }

        }
    }
});
*/