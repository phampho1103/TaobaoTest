import React, { useState } from 'react';
import axios from 'axios';

const SearchComponent = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    console.log('1. Bắt đầu tìm kiếm với từ khóa:', keyword);
    setLoading(true);
    
    try {
      setError(null);
      const ngrokUrl = 'https://58f2-2a09-bac1-7a80-10-00-279-72.ngrok-free.app/api/search';
      console.log('2. Gửi request đến:', ngrokUrl);
      
      const response = await axios.get(ngrokUrl, {
        params: { keyword },
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('3. Nhận được response:', response.data);
      
      if (!response.data.success || response.data.error_code) {
        throw new Error(response.data.error_msg || 'Lỗi không xác định');
      }
      
      setResults(response.data.data.goods_info_list || []);
    } catch (error) {
      console.log('4. Lỗi chi tiết:', {
        message: error.message,
        response: error.response?.data,
        taobaoError: error.response?.data?.taobaoError?.error_response
      });
      
      let errorMessage = 'Có lỗi xảy ra khi tìm kiếm';
      
      if (error.response?.data?.taobaoError?.error_response) {
        const taobaoError = error.response.data.taobaoError.error_response;
        errorMessage = `Lỗi API Taobao: ${taobaoError.sub_msg || taobaoError.msg} (Mã lỗi: ${taobaoError.code})`;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nhập từ khóa tìm kiếm"
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="results-container">
        {results.map((item) => (
          <div key={item.item_id} className="product-card">
            {item.material_extra_info?.aigc_model_image_list?.[0]?.optimized_image_url && (
              <img 
                src={item.material_extra_info.aigc_model_image_list[0].optimized_image_url} 
                alt={item.title} 
              />
            )}
            <h3>{item.title}</h3>
            <p className="cn-title">{item.cn_title}</p>
            <div className="price-container">
              <p className="price">{item.currency} {item.price}</p>
              {item.external_price && (
                <p className="original-price">
                  {item.currency} {item.external_price.source_promotion_price}
                </p>
              )}
            </div>
            <p className="shop">Shop: {item.shop_name}</p>
            {item.comment_score && (
              <p className="rating">Rating: {item.comment_score}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchComponent;