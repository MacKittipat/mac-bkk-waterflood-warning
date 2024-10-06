const axios = require('axios');

const waterStations = [
  {
    "id" : 49,
    "name": "CPY012 บางปะอิน",
    "location": "ต.ขนอนหลวง อ.บางปะอิน จ.พระนครศรีอยุธยา"
  },
  {
    "id" : 504974,
    "name": "C.29A ศูนย์ศิลปาชีพบางไทร",
    "location": "ต.ช้างใหญ่ อ.บางไทร จ.พระนครศรีอยุธยา"
  },
  {
    "id" : 46,
    "name": "CPY013 บางไทร",
    "location": "ต.โพแตง อ.บางไทร จ.พระนครศรีอยุธยา"
  },
  {
    "id" : 26,
    "name": "CPY014 สะพานนวลฉวี",
    "location": "ต.บ้านใหม่ อ.ปากเกร็ด จ.นนทบุรี"
  }
]

waterStations.forEach((waterStations) => {
  getData(waterStations);
})


// ม.รทก. คือ เมตร ระดับน้ำทะเลปานกลาง เป็นหน่วยวัดระดับน้ำจริงรวมค่าความสูงจากค่าระดับน้ำทะเลปานกลางแล้ว
// เส้นระดับตลิ่ง คือ ตัวบอกว่า น้ำท่วมหรือไม่ น้ำสูงเกินตลิ่ง=ท่วม

async function getData(waterStation) {
  try {
    const startDate = new Date(new Date().setDate(new Date().getDate() - 1)).toJSON().slice(0, 10);
    const endDate = new Date(new Date().setDate(new Date().getDate() + 1)).toJSON().slice(0, 10);
    const response = await axios.get(`https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_graph?station_type=tele_waterlevel&station_id=${waterStation.id}&start_date=${startDate}&end_date=${endDate}`);
    
    console.log(`Id: ${waterStation.id}, Name: ${waterStation.name}, Location: ${waterStation.location}`);
    console.log(`Duration from ${startDate} to ${endDate}`);

    const data = response.data.data;
    const graphData = data.graph_data;
    const minBank = data.min_bank;
    console.log(`minBank: ${minBank}`);

    const filteredGraphData = graphData.filter((item) => {
      return (item.datetime.endsWith('00') || item.datetime.endsWith('30')) && item.value != null;
    });

    // Get last 3 hour
    const recentWaterLevels = filteredGraphData.slice(-6).map((item) => item.value);
    console.log(`recentWaterLevels: ${recentWaterLevels}`);

    // Check if water level during the last 3 hour over min bank
    const overMinBank = recentWaterLevels.filter((item) => item > minBank).length == recentWaterLevels.length; 
    console.log(`overMinBank: ${overMinBank}`);

    // Check if water level during the last 3 hour is increasing
    if (overMinBank) {
      const sortedWaterLevels = [...recentWaterLevels].sort()
      const waterLevelIncreasing = sortedWaterLevels.toString() == recentWaterLevels.toString() 
        && [...new Set(sortedWaterLevels)].length == recentWaterLevels.length;
      console.log(`waterLevelIncreasing: ${waterLevelIncreasing}`);
    }

    console.log('=================================');


  } catch (error) {
    console.error(error);
  }
}
