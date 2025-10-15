export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const suburb = searchParams.get('suburb') || 'Belmont North';
    const propertyType = searchParams.get('property_type') || 'house';

    const apiUrl = `https://www.microburbs.com.au/report_generator/api/suburb/properties?suburb=${encodeURIComponent(suburb)}&property_type=${propertyType}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const textData = await response.text();
    
    // 替换字符串 "nan" 为 null
    const cleanedData = textData
      .replace(/:\s*"nan"/g, ': null')
      .replace(/,\s*"nan"/g, ', null')
      .replace(/:\s*NaN/g, ': null')
      .replace(/,\s*NaN/g, ', null');
    
    const data = JSON.parse(cleanedData);
    
    // 转换数据结构：results -> properties
    // 并且提取需要的字段
    if (data.results && Array.isArray(data.results)) {
      const properties = data.results.map(item => ({
        address: item.area_name || `${item.address?.street}, ${item.address?.sal}`,
        street: item.address?.street,
        suburb: item.address?.sal,
        state: item.address?.state,
        bedrooms: item.attributes?.bedrooms,
        bathrooms: item.attributes?.bathrooms,
        carspaces: item.attributes?.carspaces,
        landSize: item.attributes?.land_size,
        buildingSize: item.attributes?.building_size,
        price: item.attributes?.price || item.sale_price,
        propertyType: item.attributes?.property_type,
        description: item.attributes?.description,
        saleDate: item.sale_date,
        // 保留原始数据以备使用
        raw: item
      }));
      
      return Response.json({ 
        properties,
        count: properties.length,
        suburb: suburb
      });
    }
    
    return Response.json({ properties: [], count: 0 });
    
  } catch (error) {
    console.error('Error fetching properties:', error);
    return Response.json(
      { 
        error: 'Failed to fetch properties', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}