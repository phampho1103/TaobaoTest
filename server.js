import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { signRequest } from './src/utils.js';

const app = express();
const port = 3000;

app.use(cors({
  origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.get('/api/search', async (req, res) => {
  console.log('1. Server nhận request search với query:', req.query);
  const { keyword } = req.query;
  
  const baseParams = {
    method: 'taobao.items.search',
    app_key: '502070',
    timestamp: new Date().toISOString(),
    format: 'json',
    v: '2.0',
    sign_method: 'md5',
    q: keyword,
    fields: 'num_iid,title,price,pic_url,seller_nick'
  };

  const sign = signRequest(baseParams);

  try {
    const response = await axios({
      method: 'post',
      url: 'https://gw.api.taobao.com/router/rest',
      data: new URLSearchParams({ ...baseParams, sign }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    if (response.data.error_response) {
      throw new Error(response.data.error_response.sub_msg || response.data.error_response.msg);
    }
    
    const items = response.data.items_search_response.items.item.map(item => ({
      item_id: item.num_iid,
      title: item.title,
      price: item.price,
      currency: 'CNY',
      material_extra_info: {
        aigc_model_image_list: [{
          optimized_image_url: item.pic_url
        }]
      },
      shop_name: item.seller_nick
    }));
    
    res.json({ success: true, data: { goods_info_list: items } });
  } catch (error) {
    console.error('Lỗi server:', error.message);
    res.status(500).json({ 
      success: false,
      error_msg: error.message,
      taobaoError: error.response?.data
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});