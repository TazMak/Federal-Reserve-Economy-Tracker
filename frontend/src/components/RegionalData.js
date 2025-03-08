import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedRegionalAnalysis from './EnhancedRegionalAnalysis';
import StateTrendComparison from './StateTrendComparison';

/**
 * RegionalData component for displaying economic data by state on an interactive map
 * With enhanced regional analysis and state trend comparison
 */
const RegionalData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedIndicator, setSelectedIndicator] = useState('MSPUS'); // Default to Median House Price
  const [stateColors, setStateColors] = useState({});
  const [allStatesData, setAllStatesData] = useState({});
  const [statesData, setStatesData] = useState([]);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'comparison', 'trends'

  // Available indicators
  const indicators = [
    { id: 'UNRATE', name: 'Unemployment Rate' },
    { id: 'MSPUS', name: 'Median House Price' },
    { id: 'PCPI', name: 'Per Capita Personal Income' }
  ];

  // Fetch data for all states
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/regional/${selectedIndicator}`);
        
        // Process data for map coloring
        const stateData = {};
        const colorData = {};
        
        // Get min/max values for normalization
        const values = response.data.states
          .filter(state => state.value !== null && state.value !== undefined)
          .map(state => state.value);
        
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;
        
        // Process each state
        response.data.states.forEach(state => {
          // Store the state data
          stateData[state.code] = state;
          
          // Calculate color
          if (state.value !== null && state.value !== undefined) {
            // Normalize value between 0 and 1
            const normalizedValue = (state.value - minValue) / valueRange;
            
            // Generate color based on indicator
            let color;
            if (selectedIndicator === 'UNRATE') {
              // For unemployment, red is high (bad), green is low (good)
              const r = Math.floor(normalizedValue * 255);
              const g = Math.floor((1 - normalizedValue) * 255);
              color = `rgb(${r}, ${g}, 0)`;
            } else {
              // For income/housing prices, green is high (good), red is low (bad)
              const r = Math.floor((1 - normalizedValue) * 255);
              const g = Math.floor(normalizedValue * 255);
              color = `rgb(${r}, ${g}, 0)`;
            }
            
            colorData[state.code] = { color, value: state.value };
          } else {
            colorData[state.code] = { color: '#D3D3D3', value: null }; // Gray for no data
          }
        });
        
        setAllStatesData(stateData);
        setStateColors(colorData);
        setStatesData(response.data.states);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching regional data:', err);
        setError('Failed to load regional data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedIndicator]);

  // Handle indicator change
  const handleIndicatorChange = (e) => {
    setSelectedIndicator(e.target.value);
  };

  // Handle state hover
  const handleStateMouseEnter = (stateCode) => {
    setHoveredState(stateCode);
  };

  // Handle mouse leave
  const handleStateMouseLeave = () => {
    setHoveredState(null);
  };

  // Format value based on indicator type
  const formatValue = (value, indicator) => {
    if (value === null || value === undefined) return 'No data available';
    
    switch (indicator) {
      case 'UNRATE':
        return `${value.toFixed(1)}%`;
      case 'MSPUS':
        return `$${value.toLocaleString()}.00`;
      case 'PCPI':
        return `$${value.toLocaleString()}.00`;
      default:
        return value.toLocaleString();
    }
  };

  // Get indicator friendly name
  const getIndicatorName = (indicator) => {
    const ind = indicators.find(i => i.id === indicator);
    return ind ? ind.name : indicator;
  };
  
  // Show hovered state info
  const renderStateInfo = () => {
    if (!hoveredState || !allStatesData[hoveredState]) {
      return null;
    }
    
    const state = allStatesData[hoveredState];
    
    return (
      <div className="state-details">
        <h3>{state.name}</h3>
        <div className="state-metric">
          <h4>{getIndicatorName(selectedIndicator)}</h4>
          <div className="metric-value">
            {formatValue(state.value, selectedIndicator)}
          </div>
          <div className="metric-date">
            As of {state.date || 'N/A'}
          </div>
        </div>
        <div className="economic-overview">
          <h4>Economic Overview</h4>
          <p>
            {state.overview || 
              `${state.name}'s ${selectedIndicator === 'UNRATE' ? 'unemployment rate' : 
                selectedIndicator === 'MSPUS' ? 'housing market' : 'personal income'} 
              shows ${state.value !== null ? 
                selectedIndicator === 'UNRATE' ? 
                  state.value < 4 ? 'strong performance' : 
                  state.value < 6 ? 'moderate performance' : 'challenges' : 
                selectedIndicator === 'MSPUS' ? 
                  state.value > 400000 ? 'high prices' : 'moderate prices' : 
                  state.value > 60000 ? 'high income levels' : 'moderate income levels' 
                : 'no data available'}.`}
          </p>
        </div>
      </div>
    );
  };

  // Render tabs for different visualization modes
  const renderTabs = () => {
    return (
      <div className="visualization-tabs">
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
        <button 
          className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          State Comparison
        </button>
        <button 
          className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trend Analysis
        </button>
      </div>
    );
  };

  // Render active content based on selected tab
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <div className="map-and-details">
            <div className="us-map-container">
              <svg
                viewBox="0 0 959 593"
                className="us-map"
                role="img"
                aria-label="US Map"
              >
                {/* All state paths would go here */}
                {/* For brevity, only Alabama is shown as an example */}
                <path
              	d="M 631.8 445.1 L 631.2 446.5 L 627.9 449 L 627.6 450.7 L 624.6 452.6 L 622.5 452.3 L 615.9 450.2 L 614.8 449.2 L 614.5 446.5 L 613.2 445.5 L 612.2 443.1 L 610.5 441.2 L 610.9 438.4 L 607.1 434.4 L 606.7 430.5 L 605.4 427.5 L 605.8 426.5 L 605.1 424.4 L 605.9 423.1 L 604.5 421.4 L 602.5 417.7 L 601.2 414.1 L 602.2 411.4 L 603.7 409.1 L 605.3 409.9 L 606.7 408.1 L 608.8 407.1 L 612.2 406.8 L 615.4 404.7 L 616.8 400.8 L 618.8 395.2 L 621.1 394.7 L 625.1 396.0 L 628.8 396.5 L 632.1 395.3 L 635.8 395.8 L 637.8 397.7 L 640.3 399.3 L 642.5 400.8 L 642.3 406.1 L 640.9 409.1 L 639.5 414.5 L 636.9 421.9 L 633.9 424.9 L 632.4 429.3 L 631.4 435.7 Z"
              	id="AL"
              	fill={stateColors.AL ? stateColors.AL.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('AL')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'AL' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Alaska */}
            	<path
              	d="M 195.1 454.7 L 195.1 456.3 L 198.2 458.5 L 201.5 458.7 L 201.7 460.6 L 200.1 461.7 L 197.9 461.2 L 194.6 461.5 L 193.8 459.9 L 192.0 459.6 L 191.1 458.2 L 192.3 456.4 L 194.0 456.2 L 193.5 454.4 Z"
              	id="AK"
              	fill={stateColors.AK ? stateColors.AK.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('AK')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'AK' ? 'hovered' : ''}`}
              	transform="translate(-90, 100) scale(0.5)"
            	/>
           	 
            	{/* Arizona */}
            	<path
              	d="M 239.7 365.5 L 260.3 369.5 L 278.5 372.8 L 296.0 375.9 L 295.0 381.9 L 296.0 383.9 L 294.0 386.9 L 294.0 388.9 L 295.0 391.9 L 296.0 394.9 L 294.0 397.9 L 291.0 401.9 L 290.0 404.9 L 290.0 412.8 L 289.0 414.8 L 286.1 416.8 L 284.1 419.8 L 279.1 422.8 L 274.1 425.8 L 273.1 427.8 L 271.2 429.8 L 268.2 429.8 L 267.2 430.8 L 267.2 434.8 L 263.7 434.8 L 260.3 436.8 L 257.3 436.8 L 257.3 438.8 L 257.3 440.7 L 206.8 416.6 L 220.9 361.1 Z"
              	id="AZ"
              	fill={stateColors.AZ ? stateColors.AZ.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('AZ')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'AZ' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Arkansas */}
            	<path
              	d="M 512.3 377.2 L 512.6 380.2 L 515.6 383.3 L 515.6 386.3 L 518.6 389.3 L 521.6 392.3 L 521.6 394.3 L 523.6 397.3 L 525.6 398.3 L 526.6 401.3 L 528.6 402.3 L 528.6 405.3 L 530.5 406.3 L 529.5 408.3 L 530.5 410.3 L 529.5 412.3 L 528.5 415.3 L 526.5 415.3 L 521.5 415.3 L 517.5 415.3 L 512.5 416.3 L 512.5 414.3 L 488.5 414.3 L 485.5 413.3 L 483.5 413.3 L 481.5 411.3 L 481.5 408.3 L 480.5 404.3 L 484.5 404.3 L 484.5 402.3 L 487.5 401.3 L 488.5 398.3 L 489.5 395.3 L 490.5 390.3 L 492.5 386.3 L 495.5 383.3 L 494.5 380.3 L 496.5 379.3 L 496.5 376.3 L 497.5 373.3 L 498.5 371.3 L 501.5 369.3 L 504.5 370.3 L 505.5 372.3 L 505.5 374.3 L 508.5 373.3 L 510.3 374.2 Z"
              	id="AR"
              	fill={stateColors.AR ? stateColors.AR.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('AR')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'AR' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* California */}
            	<path
              	d="M 75.3 280.3 L 94.9 275.5 L 114.5 269.3 L 117.1 268.5 L 119.5 263.3 L 121.5 261.3 L 122.5 259.3 L 125.5 259.3 L 128.5 258.3 L 132.5 254.3 L 135.5 248.3 L 138.5 243.3 L 139.5 238.3 L 141.5 236.3 L 142.5 231.3 L 143.5 228.3 L 145.5 224.3 L 148.5 218.3 L 152.5 211.3 L 151.5 205.3 L 152.5 204.3 L 156.5 201.3 L 159.5 196.3 L 163.5 192.3 L 165.5 184.3 L 167.5 177.3 L 169.5 171.3 L 172.5 167.3 L 173.5 163.3 L 177.5 158.3 L 178.5 157.3 L 180.5 157.3 L 181.5 158.3 L 183.5 158.3 L 186.5 155.3 L 186.5 152.3 L 188.5 147.3 L 190.5 145.3 L 190.5 139.3 L 193.5 137.3 L 195.5 133.3 L 196.5 129.3 L 199.5 125.3 L 201.5 121.3 L 201.5 118.3 L 200.5 114.3 L 200.5 109.3 L 202.5 102.3 L 202.5 98.3 L 199.5 91.3 L 196.5 82.3 L 196.5 79.3 L 187.5 76.3 L 179.5 75.3 L 172.5 72.3 L 165.5 65.3 L 159.5 62.3 L 150.5 58.3 L 144.5 55.3 L 138.5 53.3 L 131.5 52.3 L 125.5 51.3 L 119.5 50.3 L 113.5 49.3 L 103.5 44.3 L 97.5 42.3 L 96.5 38.3 L 78.5 82.3 L 62.5 124.3 L 55.5 144.3 L 53.5 157.3 L 50.5 172.3 L 47.5 190.3 L 45.5 203.3 L 41.5 221.3 L 39.5 233.3 L 36.5 246.3 L 66.2 254.3 Z"
              	id="CA"
              	fill={stateColors.CA ? stateColors.CA.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('CA')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'CA' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Colorado */}
            	<path
              	d="M 362.7 266.7 L 361.7 309.8 L 361.7 325.8 L 361.7 328.8 L 302.7 322.8 L 258.7 316.8 L 240.7 313.8 L 248.7 268.8 L 253.1 258.8 L 255.1 260.8 L 271.0 262.8 L 307.0 266.8 Z"
              	id="CO"
              	fill={stateColors.CO ? stateColors.CO.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('CO')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'CO' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Connecticut */}
            	<path
              	d="M 823.8 212.1 L 825.5 207.8 L 825.5 205.8 L 822.5 201.8 L 821.5 197.8 L 824.5 194.8 L 827.5 194.8 L 830.1 198.5 L 834.1 197.5 L 833.1 193.5 L 830.1 190.5 L 829.1 184.5 L 826.1 180.5 L 822.1 177.5 L 820.1 176.5 L 818.1 176.5 L 817.1 178.5 L 816.1 178.5 L 811.1 175.5 L 810.1 173.5 L 807.1 172.5 L 803.1 172.5 L 801.1 173.5 L 801.1 175.5 L 803.1 178.5 L 803.1 181.5 L 801.1 184.5 L 801.1 187.5 L 803.1 189.5 L 804.1 194.5 L 807.1 198.5 L 807.1 200.5 L 806.1 202.5 L 804.1 204.5 L 802.1 205.5 L 801.1 208.5 L 801.1 211.5 L 805.1 213.5 L 811.8 215.1 Z"
              	id="CT"
              	fill={stateColors.CT ? stateColors.CT.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('CT')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'CT' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Delaware */}
            	<path
              	d="M 781.3 253.9 L 779.3 253.9 L 777.3 250.9 L 774.3 245.9 L 772.3 245.9 L 772.3 243.9 L 769.3 242.9 L 763.3 239.9 L 761.3 235.9 L 761.3 232.9 L 762.3 228.9 L 764.3 227.9 L 764.3 226.9 L 766.3 224.9 L 767.3 222.9 L 770.3 222.9 L 771.3 224.9 L 773.3 223.9 L 773.3 222.9 L 776.3 221.9 L 776.3 226.9 L 781.3 235.9 L 784.3 243.9 L 785.3 244.9 L 785.3 246.9 L 784.3 248.9 L 782.3 250.9 L 782.3 253.9 Z"
              	id="DE"
              	fill={stateColors.DE ? stateColors.DE.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('DE')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'DE' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Florida */}
            	<path
              	d="M 718.0 443.6 L 714.5 445.6 L 711.5 445.6 L 709.5 445.6 L 708.5 447.6 L 696.5 447.6 L 682.5 447.6 L 665.5 447.6 L 645.5 447.6 L 641.5 445.6 L 639.0 445.6 L 638.0 447.6 L 635.0 448.6 L 632.0 450.6 L 627.0 451.6 L 625.0 451.6 L 623.0 450.6 L 615.0 450.6 L 612.0 451.6 L 610.0 452.6 L 605.5 453.6 L 604.0 452.6 L 601.0 452.6 L 598.0 452.6 L 594.0 450.6 L 590.0 450.6 L 589.0 452.6 L 587.0 453.6 L 584.0 452.6 L 582.0 450.6 L 580.0 452.6 L 576.0 452.6 L 569.0 450.6 L 565.0 446.6 L 564.0 444.6 L 564.0 442.6 L 565.0 440.6 L 566.0 436.6 L 564.0 431.6 L 565.0 428.6 L 565.0 425.6 L 567.0 423.6 L 569.0 420.6 L 571.0 418.6 L 572.0 414.6 L 574.0 413.6 L 575.0 410.6 L 576.0 408.6 L 579.0 407.6 L 579.0 404.6 L 581.0 403.6 L 583.0 400.6 L 585.0 399.6 L 587.0 394.6 L 591.0 391.6 L 591.0 389.6 L 592.0 387.6 L 595.0 386.6 L 595.0 384.6 L 593.0 383.6 L 594.0 381.6 L 596.0 382.6 L 599.0 383.6 L 602.0 384.6 L 603.0 384.6 L 604.0 386.6 L 606.0 386.6 L 608.0 386.6 L 610.0 389.6 L 611.0 392.6 L 610.0 394.6 L 607.0 394.6 L 604.0 395.6 L 601.0 398.6 L 600.0 400.6 L 601.0 402.6 L 601.0 405.6 L 602.0 407.6 L 603.0 407.6 L 605.0 410.6 L 607.0 410.6 L 610.0 412.6 L 612.0 414.6 L 613.0 419.6 L 614.0 422.6 L 615.0 424.6 L 616.0 427.6 L 618.0 429.6 L 620.0 433.6 L 623.0 436.6 L 625.0 439.6 L 626.0 441.6 L 628.0 442.6 L 631.5 442.6 L 635.0 443.6 L 637.0 442.6 L 642.0 441.6 L 642.0 435.6 L 644.0 433.6 L 645.0 430.6 L 648.0 427.6 L 650.0 423.6 L 652.0 421.6 L 654.0 419.6 L 654.0 416.6 L 658.0 410.6 L 661.0 404.6 L 662.0 400.6 L 665.0 397.6 L 668.0 394.6 L 671.0 391.6 L 673.0 385.6 L 675.0 383.6 L 676.0 380.6 L 678.0 376.6 L 680.0 372.6 L 682.0 371.6 L 683.0 369.6 L 683.0 365.6 L 685.0 361.6 L 687.0 359.6 L 691.0 357.6 L 696.0 357.6 L 697.0 359.6 L 696.0 362.6 L 695.0 366.6 L 694.0 368.6 L 693.0 371.6 L 693.0 372.6 L 695.0 371.6 L 697.0 373.6 L 700.0 371.6 L 702.0 370.6 L 704.0 371.6 L 704.0 374.6 L 705.0 377.6 L 707.0 377.6 L 710.0 375.6 L 711.0 376.6 L 713.0 376.6 L 713.0 374.6 L 714.0 372.6 L 717.0 372.6 L 716.0 374.6 L 715.0 377.6 L 713.0 378.6 L 714.0 380.6 L 716.0 381.6 L 717.0 381.6 L 716.0 384.6 L 714.0 385.6 L 714.0 387.6 L 718.0 387.6 L 719.0 386.6 L 719.0 383.6 L 720.0 382.6 L 723.0 382.6 L 724.0 386.6 L 726.0 389.6 L 727.0 391.6 L 726.0 394.6 L 724.0 397.6 L 721.0 399.6 L 721.0 400.6 L 723.0 402.6 L 725.0 403.6 L 726.0 403.6 L 727.0 401.6 L 729.0 401.6 L 730.0 402.6 L 730.0 405.6 L 732.0 406.6 L 733.0 409.6 L 731.0 410.6 L 729.0 412.6 L 725.0 414.6 L 723.0 417.6 L 720.0 419.6 L 718.0 423.6 L 719.0 426.6 L 720.0 430.6 L 720.0 434.6 L 721.0 436.6 L 720.0 440.6 Z"
              	id="FL"
              	fill={stateColors.FL ? stateColors.FL.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('FL')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'FL' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Hawaii */}
            	<path
              	d="M 233.1 511.8 L 235.1 513.8 L 233.1 516.8 L 230.1 518.8 L 227.1 517.8 L 225.1 514.8 L 226.1 512.8 L 229.1 511.8 Z"
              	id="HI"
              	fill={stateColors.HI ? stateColors.HI.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('HI')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'HI' ? 'hovered' : ''}`}
              	transform="translate(0, 0) scale(1)"
            	/>
           	 
            	{/* Idaho */}
            	<path
              	d="M 198.0 157.1 L 198.1 157.1 L 198.0 156.9 L 198.0 157.1 Z M 196.9 175.3 L 199.1 173.5 L 200.1 172.5 L 203.1 171.5 L 208.1 168.5 L 213.1 164.5 L 214.1 162.5 L 216.1 162.5 L 220.1 161.5 L 221.1 159.5 L 221.1 158.5 L 218.1 156.5 L 218.1 154.5 L 215.1 153.5 L 215.1 151.5 L 214.1 149.5 L 212.1 148.5 L 210.1 144.5 L 208.1 140.5 L 207.1 136.5 L 207.1 134.5 L 204.1 131.5 L 203.1 128.5 L 203.1 122.5 L 201.1 120.5 L 201.1 117.5 L 199.1 115.5 L 197.1 112.5 L 197.1 109.5 L 195.1 109.5 L 194.1 106.5 L 194.1 102.5 L 192.1 100.5 L 190.1 95.5 L 189.1 91.5 L 188.1 89.5 L 183.1 85.5 L 180.1 80.5 L 179.1 77.5 L 177.1 74.5 L 174.1 71.5 L 175.1 70.5 L 177.1 69.5 L 178.1 67.5 L 178.1 64.5 L 183.1 61.5 L 187.1 60.5 L 190.1 61.5 L 194.1 60.5 L 196.1 62.5 L 199.1 62.5 L 202.1 62.5 L 202.1 66.5 L 204.1 72.5 L 208.1 72.5 L 208.1 74.5 L 209.1 76.5 L 212.1 76.5 L 215.1 77.5 L 215.1 83.5 L 213.1 85.5 L 213.1 88.5 L 214.1 90.5 L 215.1 90.5 L 219.1 88.5 L 221.1 86.5 L 222.1 86.5 L 225.1 85.5 L 228.1 82.5 L 231.1 86.5 L 237.1 93.5 L 242.1 97.5 L 243.1 99.5 L 245.1 99.5 L 245.1 101.5 L 243.1 105.5 L 243.1 107.5 L 244.1 109.5 L 246.1 108.5 L 249.1 113.5 L 251.1 116.5 L 255.1 119.5 L 258.1 123.5 L 258.1 127.5 L 257.1 128.5 L 254.1 127.5 L 253.1 128.5 L 252.1 130.5 L 249.1 129.5 L 247.1 131.5 L 246.1 133.5 L 243.1 134.5 L 244.1 136.5 L 244.1 140.5 L 241.1 145.5 L 241.1 147.5 L 241.1 149.5 L 239.1 152.5 L 237.1 153.5 L 235.1 157.5 L 231.1 160.5 L 226.1 163.5 L 223.1 165.5 L 222.1 167.5 L 220.1 168.5 L 216.1 170.5 L 209.1 172.5 L 202.1 172.5 L 201.1 173.5 L 200.1 174.5 Z"
              	id="ID"
              	fill={stateColors.ID ? stateColors.ID.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('ID')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'ID' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Illinois */}
            	<path
              	d="M 598.6 247.9 L 597.6 249.9 L 596.6 253.9 L 596.6 256.9 L 594.6 259.9 L 594.6 262.9 L 593.6 266.9 L 590.6 269.9 L 589.6 272.9 L 589.6 276.9 L 588.6 279.9 L 586.6 281.9 L 586.6 285.9 L 587.6 290.9 L 587.6 294.9 L 585.6 297.9 L 583.6 299.9 L 583.6 303.9 L 582.6 306.9 L 583.6 309.9 L 583.6 313.9 L 582.6 318.9 L 580.6 321.9 L 578.6 323.9 L 576.6 326.9 L 576.6 330.9 L 575.6 334.9 L 573.6 336.9 L 571.6 338.9 L 570.6 340.9 L 568.6 341.9 L 567.6 338.9 L 565.6 333.9 L 562.6 326.9 L 560.6 322.9 L 560.6 315.9 L 558.6 312.9 L 558.6 307.9 L 557.6 306.9 L 555.6 302.9 L 553.6 301.9 L 552.6 298.9 L 551.6 295.9 L 549.6 294.9 L 549.6 292.9 L 547.6 291.9 L 547.6 289.9 L 547.6 287.9 L 552.6 288.9 L 556.6 288.9 L 565.6 288.9 L 575.6 288.9 L 578.6 286.9 L 580.6 284.9 L 579.6 281.9 L 579.6 276.9 L 580.6 272.9 L 582.6 268.9 L 583.6 265.9 L 583.6 261.9 L 585.6 255.9 L 586.6 251.9 L 588.6 247.9 L 592.6 244.9 L 595.6 243.9 L 598.6 246.9 Z"
              	id="IL"
              	fill={stateColors.IL ? stateColors.IL.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('IL')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'IL' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Indiana */}
            	<path
              	d="M 629.2 218.9 L 628.7 222.0 L 627.2 226.9 L 626.2 231.9 L 625.2 234.9 L 623.2 241.9 L 622.2 247.9 L 620.2 253.9 L 618.2 263.9 L 616.2 271.9 L 614.2 280.9 L 613.2 285.9 L 612.2 288.9 L 607.2 288.9 L 598.2 288.9 L 588.2 288.9 L 587.2 288.9 L 585.2 286.9 L 585.2 283.9 L 586.2 280.9 L 586.2 276.9 L 587.2 272.9 L 589.2 269.9 L 590.2 265.9 L 591.2 262.9 L 593.2 256.9 L 595.2 253.9 L 595.2 248.9 L 597.2 244.9 L 600.2 242.9 L 605.2 241.9 L 611.2 239.9 L 615.2 237.9 L 619.2 236.9 L 621.2 234.9 L 624.2 228.9 L 625.2 224.9 L 625.2 221.9 L 627.2 218.9 Z"
              	id="IN"
              	fill={stateColors.IN ? stateColors.IN.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('IN')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'IN' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Iowa */}
            	<path
              	d="M 553.7 222.1 L 553.7 223.1 L 557.7 224.1 L 562.7 225.1 L 565.7 224.1 L 568.7 225.1 L 573.7 225.1 L 574.7 223.1 L 575.7 221.1 L 576.7 219.1 L 579.7 218.1 L 580.7 215.1 L 582.7 214.1 L 582.7 212.1 L 585.7 210.1 L 586.7 207.1 L 590.7 206.1 L 594.7 206.1 L 598.7 207.1 L 600.7 206.1 L 603.7 203.1 L 603.7 199.1 L 604.7 196.1 L 602.7 193.1 L 602.7 190.1 L 600.7 187.1 L 599.7 184.1 L 596.7 182.1 L 595.7 178.1 L 594.7 176.1 L 591.7 174.1 L 589.7 171.1 L 589.7 169.1 L 555.7 169.1 L 536.7 168.1 L 535.7 174.1 L 535.7 178.1 L 534.7 181.1 L 534.7 189.1 L 534.7 193.1 L 534.7 198.1 L 535.7 202.1 L 537.7 208.1 L 537.7 211.1 L 539.7 216.1 L 542.7 218.1 L 543.7 221.1 L 547.7 221.1 L 549.7 222.1 Z"
              	id="IA"
              	fill={stateColors.IA ? stateColors.IA.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('IA')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'IA' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Kansas */}
            	<path
              	d="M 499.8 274.7 L 501.1 274.7 L 540.1 275.7 L 556.1 275.7 L 561.1 275.7 L 561.1 273.7 L 562.1 269.7 L 562.1 267.7 L 564.1 262.7 L 564.1 252.7 L 562.1 246.7 L 562.1 243.7 L 563.1 238.7 L 562.1 234.7 L 562.1 231.7 L 563.1 229.7 L 505.1 229.7 L 471.1 228.7 L 473.1 238.7 L 473.1 243.7 L 475.1 248.7 L 476.1 252.7 L 478.1 258.7 L 480.1 263.7 L 482.1 268.7 L 483.1 271.7 L 484.1 274.7 Z"
              	id="KS"
              	fill={stateColors.KS ? stateColors.KS.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('KS')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'KS' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Kentucky */}
            	<path
              	d="M 637.8 304.7 L 635.8 306.7 L 632.8 308.7 L 628.8 308.7 L 626.8 310.7 L 624.8 312.7 L 620.8 315.7 L 617.8 316.7 L 614.8 320.7 L 613.8 323.7 L 610.8 324.7 L 607.8 327.7 L 604.8 327.7 L 602.8 329.7 L 600.8 330.7 L 597.8 330.7 L 594.8 330.7 L 592.8 333.7 L 590.8 336.7 L 586.8 339.7 L 581.8 339.7 L 576.8 339.7 L 573.8 337.7 L 569.8 338.7 L 567.8 337.7 L 565.8 335.7 L 564.8 333.7 L 564.8 330.7 L 561.8 325.7 L 559.8 322.7 L 559.8 316.7 L 558.8 315.7 L 556.8 311.7 L 554.8 309.7 L 553.8 305.7 L 552.8 303.7 L 550.8 301.7 L 549.8 298.7 L 547.8 297.7 L 547.8 295.7 L 545.8 294.7 L 545.8 292.7 L 545.8 288.7 L 546.8 286.7 L 573.8 286.7 L 581.8 286.7 L 608.8 285.7 L 609.8 283.7 L 610.8 278.7 L 612.8 277.7 L 613.8 274.7 L 612.8 270.7 L 613.8 269.7 L 615.8 267.7 L 616.8 266.7 L 618.8 267.7 L 620.8 267.7 L 623.8 265.7 L 625.8 265.7 L 627.8 265.7 L 629.8 265.7 L 633.8 266.7 L 636.8 269.7 L 639.8 272.7 L 641.8 274.7 L 642.8 278.7 L 643.8 282.7 L 647.8 286.7 L 653.8 288.7 L 659.8 289.7 L 660.8 293.7 L 662.8 297.7 L 661.8 301.7 L 657.8 302.7 L 653.8 303.7 L 649.8 302.7 L 646.8 303.7 L 643.8 302.7 L 640.8 302.7 Z"
              	id="KY"
              	fill={stateColors.KY ? stateColors.KY.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('KY')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'KY' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Louisiana */}
            	<path
              	d="M 566.3 466.6 L 564.3 463.6 L 564.3 458.6 L 566.3 455.6 L 569.3 452.6 L 572.3 451.6 L 572.3 449.6 L 571.3 447.6 L 570.3 442.6 L 570.3 439.6 L 568.3 437.6 L 566.3 434.6 L 563.3 431.6 L 563.3 427.6 L 561.3 424.6 L 559.3 419.6 L 559.3 417.6 L 558.3 413.6 L 557.3 411.6 L 555.3 409.6 L 554.3 407.6 L 553.3 405.6 L 549.3 401.6 L 543.3 397.6 L 539.3 395.6 L 537.3 395.6 L 536.3 397.6 L 531.3 396.6 L 526.3 396.6 L 523.3 397.6 L 519.3 399.6 L 515.3 402.6 L 513.3 404.6 L 510.3 406.6 L 510.3 409.6 L 513.3 409.6 L 513.3 412.6 L 513.3 414.6 L 513.3 416.6 L 516.3 416.6 L 518.3 415.6 L 520.3 415.6 L 523.3 415.6 L 526.3 415.6 L 530.3 416.6 L 530.3 418.6 L 531.3 422.6 L 530.3 426.6 L 530.3 430.6 L 532.3 434.6 L 536.3 435.6 L 538.3 439.6 L 539.3 444.6 L 539.3 447.6 L 539.3 450.6 L 541.3 452.6 L 544.3 452.6 L 548.3 450.6 L 550.3 450.6 L 552.3 452.6 L 551.3 456.6 L 550.3 457.6 L 547.3 458.6 L 545.3 461.6 L 542.3 465.6 L 536.3 467.6 L 533.3 467.6 L 530.3 465.6 L 530.3 463.6 L 534.3 461.6 L 534.3 460.6 L 532.3 458.6 L 531.3 460.6 L 528.3 461.6 L 526.3 461.6 L 521.3 461.6 L 519.3 459.6 L 518.3 454.6 L 517.3 452.6 L 514.3 452.6 L 512.3 450.6 L 508.3 450.6 L 504.3 451.6 L 503.3 453.6 L 504.3 457.6 L 507.3 458.6 L 510.3 459.6 L 512.3 459.6 L 514.3 459.6 L 514.3 461.6 L 516.3 463.6 L 517.3 468.6 L 517.3 471.6 L 518.3 475.6 L 521.3 475.6 L 525.3 475.6 L 527.3 473.6 L 527.3 470.6 L 529.3 470.6 L 530.3 473.6 L 530.3 476.6 L 529.3 481.6 L 527.3 483.6 L 529.3 486.6 L 530.3 490.6 L 532.3 490.6 L 534.3 493.6 L 536.3 494.6 L 538.3 493.6 L 537.3 491.6 L 536.3 484.6 L 538.3 477.6 L 539.3 472.6 L 543.3 474.6 L 545.3 477.6 L 545.3 480.6 L 547.3 481.6 L 551.3 480.6 L 556.3 479.6 L 558.3 476.6 L 559.3 472.6 L 561.3 470.6 L 566.3 469.6 Z"
              	id="LA"
              	fill={stateColors.LA ? stateColors.LA.color : '#D3D3D3'}
              	onMouseEnter={() => handleStateMouseEnter('LA')}
              	onMouseLeave={handleStateMouseLeave}
              	className={`state-path ${hoveredState === 'LA' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Maine */}
            	<path
            	d="M 848.5 103.2 L 847.5 102.2 L 845.5 97.2 L 844.5 95.2 L 844.5 92.2 L 842.5 89.2 L 841.5 83.2 L 839.5 79.2 L 839.5 77.2 L 837.5 74.2 L 836.5 71.2 L 833.5 66.2 L 832.5 62.2 L 831.5 61.2 L 830.5 55.2 L 829.5 54.2 L 826.5 54.2 L 824.5 53.2 L 824.5 50.2 L 825.5 48.2 L 825.5 46.2 L 824.5 44.2 L 825.5 41.2 L 824.5 39.2 L 821.5 37.2 L 821.5 33.2 L 823.5 32.2 L 823.5 30.2 L 822.5 29.2 L 821.5 26.2 L 821.5 23.2 L 822.5 21.2 L 822.5 21.2 L 824.5 21.2 L 825.5 21.2 L 826.5 19.2 L 826.5 18.2 L 823.5 15.2 L 825.5 10.2 L 825.5 8.2 L 826.5 6.2 L 827.5 5.2 L 827.5 2.2 L 829.5 2.2 L 834.5 5.2 L 837.5 9.2 L 841.5 14.2 L 843.5 18.2 L 844.5 20.2 L 846.5 22.2 L 847.5 24.2 L 847.5 27.2 L 844.5 27.2 L 844.5 29.2 L 845.5 32.2 L 845.5 34.2 L 846.5 36.2 L 848.5 39.2 L 852.5 44.2 L 855.5 49.2 L 856.5 52.2 L 855.5 54.2 L 856.5 56.2 L 855.5 60.2 L 855.5 62.2 L 856.5 64.2 L 858.5 66.2 L 859.5 69.2 L 860.5 74.2 L 861.5 78.2 L 864.5 84.2 L 867.5 93.2 L 869.5 97.2 L 873.5 101.2 L 875.5 102.2 L 873.5 105.2 L 872.5 106.2 L 871.5 104.2 L 869.5 104.2 L 867.5 106.2 L 863.5 104.2 L 861.5 104.2 L 858.5 106.2 L 857.5 108.2 L 856.5 107.2 L 854.5 105.2 L 853.5 104.2 L 852.5 104.2 Z"
            	id="ME"
            	fill={stateColors.ME ? stateColors.ME.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('ME')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'ME' ? 'hovered' : ''}`}
            	/>

            	{/* Maryland */}
            	<path
            	d="M 773.9 240.8 L 773.9 242.8 L 772.9 243.8 L 772.9 245.8 L 773.9 246.8 L 776.9 246.8 L 778.9 248.8 L 779.9 249.8 L 779.9 251.8 L 781.9 251.8 L 782.9 253.8 L 781.9 255.8 L 779.9 256.8 L 779.9 258.8 L 775.9 258.8 L 772.9 258.8 L 770.9 259.8 L 767.9 259.8 L 766.9 261.8 L 763.9 262.8 L 761.9 265.8 L 757.9 266.8 L 755.9 265.8 L 753.9 262.8 L 751.9 261.8 L 749.9 257.8 L 748.9 256.8 L 747.9 254.8 L 744.9 252.8 L 742.9 248.8 L 740.9 246.8 L 737.9 243.8 L 736.9 240.8 L 735.9 239.8 L 734.9 236.8 L 731.9 233.8 L 732.9 231.8 L 734.9 228.8 L 734.9 226.8 L 733.9 224.8 L 731.9 223.8 L 727.9 222.8 L 726.9 220.8 L 725.9 219.8 L 726.9 217.8 L 720.9 217.8 L 718.9 215.8 L 715.9 215.8 L 713.9 213.8 L 710.9 213.8 L 708.9 211.8 L 706.9 211.8 L 704.9 209.8 L 703.9 208.8 L 704.9 208.8 L 706.9 210.8 L 710.9 210.8 L 714.9 212.8 L 716.9 212.8 L 720.9 213.8 L 724.9 216.8 L 728.9 217.8 L 730.9 219.8 L 733.9 221.8 L 736.9 221.8 L 738.9 219.8 L 741.9 219.8 L 742.9 221.8 L 746.9 223.8 L 748.9 225.8 L 754.9 225.8 L 758.9 223.8 L 762.9 223.8 L 766.9 224.8 L 768.9 224.8 L 770.9 225.8 L 775.9 225.8 L 777.9 226.8 L 778.9 227.8 L 778.9 229.8 L 775.9 233.8 L 773.9 236.8 L 771.9 239.8 Z"
            	id="MD"
            	fill={stateColors.MD ? stateColors.MD.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('MD')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'MD' ? 'hovered' : ''}`}
            	/>

            	{/* Massachusetts */}
            	<path
            	d="M 832.9 153.8 L 835.9 153.8 L 839.9 152.8 L 842.9 152.8 L 844.9 151.8 L 847.9 152.8 L 847.9 155.8 L 844.9 157.8 L 841.9 158.8 L 838.9 159.8 L 836.9 159.8 L 834.9 159.8 L 832.9 158.8 L 831.9 156.8 L 832.9 155.8 Z M 830.6 178.2 L 836.6 177.2 L 839.6 175.2 L 843.6 173.2 L 843.6 171.2 L 841.6 172.2 L 837.6 173.2 L 834.6 172.2 L 828.6 171.2 L 825.6 170.2 L 824.6 168.2 L 822.6 167.2 L 818.6 167.2 L 816.6 167.2 L 815.6 169.2 L 813.6 171.2 L 810.6 172.2 L 810.6 173.2 L 813.6 174.2 L 816.6 175.2 L 818.6 175.2 L 820.6 175.2 L 822.6 177.2 L 824.6 178.2 Z M 826.9 170.1 L 824.9 171.1 L 822.9 171.1 L 818.9 168.1 L 816.9 166.1 L 812.9 166.1 L 807.9 167.1 L 805.9 165.1 L 802.9 163.1 L 802.9 161.1 L 804.9 159.1 L 806.9 159.1 L 806.9 158.1 L 805.9 157.1 L 804.9 156.1 L 802.9 156.1 L 799.9 158.1 L 797.9 159.1 L 794.9 161.1 L 791.9 161.1 L 789.9 162.1 L 788.9 163.1 L 790.9 164.1 L 793.9 164.1 L 795.9 166.1 L 798.9 167.1 L 801.9 167.1 L 803.9 167.1 L 805.9 168.1 L 806.9 169.1 L 806.9 171.1 L 807.9 173.1 L 810.9 173.1 L 812.9 173.1 L 816.9 176.1 L 818.9 177.1 L 819.9 178.1 L 823.9 178.1 L 826.9 176.1 L 826.9 172.1 Z"
            	id="MA"
            	fill={stateColors.MA ? stateColors.MA.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('MA')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'MA' ? 'hovered' : ''}`}
            	/>

            	{/* Michigan */}
            	<path
            	d="M 644.3 121.6 L 644.3 124.6 L 644.3 129.6 L 644.3 134.6 L 645.3 138.6 L 647.3 144.6 L 648.3 151.6 L 650.3 157.6 L 652.3 161.6 L 652.3 164.6 L 650.3 166.6 L 648.3 166.6 L 647.3 165.6 L 644.3 164.6 L 643.3 162.6 L 641.3 163.6 L 639.3 167.6 L 637.3 169.6 L 634.3 169.6 L 632.3 170.6 L 629.3 172.6 L 627.3 172.6 L 626.3 170.6 L 626.3 166.6 L 627.3 165.6 L 629.3 162.6 L 631.3 158.6 L 631.3 156.6 L 631.3 152.6 L 628.3 151.6 L 624.3 150.6 L 621.3 148.6 L 621.3 145.6 L 623.3 143.6 L 625.3 139.6 L 626.3 136.6 L 628.3 133.6 L 630.3 133.6 L 632.3 131.6 L 634.3 130.6 L 635.3 127.6 L 637.3 126.6 L 638.3 122.6 L 639.3 121.6 Z M 665.5 188.1 L 663.5 193.1 L 665.5 197.1 L 666.5 200.1 L 665.5 204.1 L 664.5 206.1 L 661.5 206.1 L 657.5 207.1 L 651.5 207.1 L 648.5 206.1 L 645.5 205.1 L 642.5 205.1 L 640.5 201.1 L 638.5 198.1 L 637.5 194.1 L 634.5 192.1 L 633.5 189.1 L 631.5 186.1 L 631.5 183.1 L 631.5 180.1 L 628.5 177.1 L 626.5 178.1 L 625.5 181.1 L 622.5 183.1 L 619.5 183.1 L 618.5 184.1 L 616.5 189.1 L 613.5 193.1 L 612.5 195.1 L 612.5 197.1 L 612.5 199.1 L 609.5 202.1 L 607.5 202.1 L 604.5 201.1 L 602.5 199.1 L 599.5 198.1 L 599.5 200.1 L 600.5 202.1 L 598.5 204.1 L 592.5 206.1 L 590.5 204.1 L 587.5 204.1 L 585.5 203.1 L 584.5 201.1 L 582.5 201.1 L 581.5 199.1 L 582.5 196.1 L 585.5 195.1 L 585.5 192.1 L 584.5 190.1 L 584.5 187.1 L 585.5 186.1 L 588.5 185.1 L 591.5 185.1 L 593.5 182.1 L 593.5 179.1 L 588.5 176.1 L 584.5 175.1 L 581.5 173.1 L 580.5 170.1 L 579.5 167.1 L 579.5 165.1 L 582.5 163.1 L 586.5 162.1 L 589.5 162.1 L 592.5 162.1 L 595.5 163.1 L 599.5 164.1 L 602.5 167.1 L 606.5 168.1 L 608.5 167.1 L 609.5 165.1 L 612.5 165.1 L 615.5 166.1 L 618.5 168.1 L 620.5 171.1 L 622.5 171.1 L 625.5 170.1 L 628.5 169.1 L 632.5 168.1 L 635.5 167.1 L 637.5 166.1 L 639.5 165.1 L 643.5 164.1 L 644.5 166.1 L 646.5 168.1 L 648.5 170.1 L 651.5 172.1 L 653.5 172.1 L 656.5 173.1 L 657.5 176.1 L 661.5 179.1 L 664.5 183.1 Z"
            	id="MI"
            	fill={stateColors.MI ? stateColors.MI.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('MI')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'MI' ? 'hovered' : ''}`}
            	/>

            	{/* Minnesota */}
            	<path
            	d="M 553.6 127.3 L 553.6 171.3 L 536.6 171.3 L 506.6 170.3 L 506.6 164.3 L 505.6 152.3 L 504.6 140.3 L 504.6 113.3 L 503.6 110.3 L 504.6 107.3 L 506.6 105.3 L 509.6 102.3 L 510.6 98.3 L 509.6 93.3 L 510.6 87.3 L 510.6 81.3 L 512.6 76.3 L 516.6 74.3 L 517.6 71.3 L 518.6 69.3 L 518.6 65.3 L 520.6 60.3 L 521.6 58.3 L 523.6 58.3 L 524.6 60.3 L 526.6 59.3 L 529.6 59.3 L 536.6 59.3 L 538.6 61.3 L 539.6 63.3 L 542.6 63.3 L 543.6 65.3 L 546.6 66.3 L 547.6 68.3 L 551.6 70.3 L 553.6 72.3 L 553.6 74.3 L 552.6 78.3 L 551.6 80.3 L 551.6 85.3 L 554.6 93.3 L 556.6 97.3 L 556.6 101.3 L 555.6 105.3 L 553.6 108.3 L 553.6 112.3 L 554.6 116.3 L 554.6 121.3 Z"
            	id="MN"
            	fill={stateColors.MN ? stateColors.MN.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('MN')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'MN' ? 'hovered' : ''}`}
            	/>

            	{/* Mississippi */}
            	<path
            	d="M 598.9 400.8 L 598.9 402.8 L 597.9 407.8 L 597.9 412.8 L 595.9 417.8 L 593.9 421.8 L 594.9 425.8 L 595.9 430.8 L 596.9 434.8 L 596.9 437.8 L 595.9 441.8 L 595.9 443.8 L 596.9 445.8 L 598.9 447.8 L 598.9 450.8 L 595.9 450.8 L 590.9 450.8 L 588.9 449.8 L 585.9 449.8 L 581.9 452.8 L 577.9 452.8 L 575.9 450.8 L 572.9 451.8 L 570.9 450.8 L 569.9 447.8 L 569.9 443.8 L 567.9 439.8 L 565.9 437.8 L 565.9 434.8 L 564.9 431.8 L 562.9 428.8 L 561.9 424.8 L 559.9 419.8 L 559.9 418.8 L 557.9 414.8 L 556.9 410.8 L 554.9 407.8 L 553.9 403.8 L 552.9 401.8 L 550.9 399.8 L 548.9 395.8 L 545.9 392.8 L 543.9 393.8 L 539.9 393.8 L 536.9 395.8 L 530.9 396.8 L 530.9 386.8 L 531.9 383.8 L 531.9 379.8 L 533.9 374.8 L 534.9 369.8 L 537.9 364.8 L 539.9 358.8 L 542.9 352.8 L 544.9 345.8 L 544.9 343.8 L 546.9 342.8 L 546.9 340.8 L 547.9 339.8 L 570.9 339.8 L 573.9 337.8 L 577.9 337.8 L 578.9 339.8 L 582.9 339.8 L 585.9 338.8 L 586.9 340.8 L 589.9 340.8 L 590.9 342.8 L 592.9 342.8 L 594.9 344.8 L 594.9 347.8 L 596.9 348.8 L 597.9 347.8 L 598.9 347.8 L 599.9 351.8 L 598.9 354.8 L 596.9 357.8 L 595.9 361.8 L 594.9 365.8 L 596.9 367.8 L 598.9 368.8 L 599.9 372.8 L 600.9 375.8 L 600.9 379.8 L 600.9 383.8 L 602.9 386.8 L 602.9 389.8 L 602.9 392.8 L 600.9 395.8 L 598.9 398.8 Z"
            	id="MS"
            	fill={stateColors.MS ? stateColors.MS.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('MS')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'MS' ? 'hovered' : ''}`}
            	/>

            	{/* Missouri */}
            	<path
            	d="M 553.6 335.8 L 554.6 326.8 L 558.6 315.8 L 558.6 312.8 L 560.6 308.8 L 560.6 304.8 L 562.6 302.8 L 562.6 299.8 L 561.6 294.8 L 561.6 290.8 L 563.6 286.8 L 563.6 283.8 L 563.6 280.8 L 563.6 277.8 L 561.6 273.8 L 557.6 273.8 L 505.6 273.8 L 500.6 273.8 L 497.6 274.8 L 495.6 277.8 L 493.6 277.8 L 492.6 280.8 L 489.6 278.8 L 486.6 280.8 L 485.6 282.8 L 483.6 283.8 L 483.6 285.8 L 483.6 290.8 L 483.6 294.8 L 482.6 298.8 L 480.6 303.8 L 480.6 308.8 L 483.6 309.8 L 485.6 309.8 L 485.6 311.8 L 483.6 315.8 L 484.6 318.8 L 484.6 321.8 L 484.6 325.8 L 485.6 328.8 L 485.6 330.8 L 488.6 330.8 L 496.6 331.8 L 500.6 330.8 L 503.6 330.8 L 507.6 331.8 L 512.6 331.8 L 516.6 334.8 L 518.6 334.8 L 524.6 332.8 L 527.6 332.8 L 530.6 334.8 L 539.6 334.8 L 542.6 336.8 L 545.6 336.8 L 548.6 336.8 L 551.6 335.8 Z"
            	id="MO"
            	fill={stateColors.MO ? stateColors.MO.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('MO')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'MO' ? 'hovered' : ''}`}
            	/>

            	{/* Montana */}
            	<path
            	d="M 271.7 58.9 L 273.7 120.9 L 273.7 129.9 L 273.7 130.9 L 268.7 130.9 L 264.7 128.9 L 258.7 129.9 L 253.7 128.9 L 252.7 129.9 L 246.7 129.9 L 244.7 132.9 L 243.7 131.9 L 241.7 131.9 L 240.7 133.9 L 236.7 134.9 L 234.7 136.9 L 234.7 140.9 L 233.7 141.9 L 233.7 143.9 L 230.7 143.9 L 230.7 145.9 L 228.7 148.9 L 226.7 148.9 L 224.7 147.9 L 222.7 146.9 L 222.7 144.9 L 220.7 143.9 L 219.7 140.9 L 216.7 139.9 L 214.7 137.9 L 212.7 136.9 L 211.7 136.9 L 208.7 132.9 L 206.7 130.9 L 206.7 126.9 L 204.7 124.9 L 203.7 121.9 L 202.7 119.9 L 199.7 117.9 L 197.7 115.9 L 195.7 112.9 L 195.7 110.9 L 194.7 108.9 L 193.7 103.9 L 192.7 102.9 L 191.7 100.9 L 190.7 96.9 L 188.7 94.9 L 188.7 90.9 L 187.7 86.9 L 183.7 82.9 L 182.7 78.9 L 180.7 76.9 L 179.7 73.9 L 176.7 69.9 L 175.7 67.9 L 176.7 66.9 L 178.7 64.9 L 178.7 62.9 L 183.7 61.9 L 188.7 60.9 L 194.7 58.9 L 200.7 58.9 L 203.7 60.9 L 203.7 64.9 L 206.7 65.9 L 208.7 68.9 L 211.7 69.9 L 213.7 68.9 L 214.7 69.9 L 218.7 69.9 L 220.7 68.9 L 222.7 69.9 L 224.7 70.9 L 227.7 70.9 L 229.7 69.9 L 232.7 70.9 L 236.7 69.9 L 239.7 68.9 L 242.7 66.9 L 244.7 66.9 L 248.7 64.9 L 251.7 64.9 L 253.7 63.9 L 253.7 59.9 L 254.7 57.9 Z"
            	id="MT"
            	fill={stateColors.MT ? stateColors.MT.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('MT')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'MT' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Nebraska */}
            	<path
            	d="M 462.6 249.3 L 462.6 232.3 L 462.6 220.3 L 464.6 214.3 L 466.6 207.3 L 471.6 204.3 L 474.6 204.3 L 477.6 204.3 L 481.6 203.3 L 484.6 203.3 L 488.6 203.3 L 488.6 206.3 L 492.6 209.3 L 495.6 211.3 L 498.6 211.3 L 499.6 213.3 L 502.6 214.3 L 504.6 212.3 L 506.6 212.3 L 507.6 213.3 L 511.6 212.3 L 513.6 212.3 L 516.6 214.3 L 518.6 215.3 L 520.6 215.3 L 520.6 217.3 L 519.6 219.3 L 519.6 222.3 L 519.6 225.3 L 520.6 227.3 L 521.6 229.3 L 521.6 232.3 L 562.6 232.3 L 562.6 236.3 L 562.6 239.3 L 563.6 243.3 L 563.6 247.3 L 563.6 251.3 L 561.6 256.3 L 561.6 259.3 L 561.6 267.3 L 563.6 272.3 L 563.6 275.3 L 506.6 275.3 L 473.6 274.3 L 473.6 268.3 L 471.6 261.3 L 471.6 257.3 L 469.6 251.3 L 466.6 249.3 Z"
            	id="NE"
            	fill={stateColors.NE ? stateColors.NE.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('NE')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'NE' ? 'hovered' : ''}`}
            	/>

            	{/* Nevada */}
            	<path
            	d="M 178.8 310.7 L 165.8 254.7 L 162.8 241.7 L 161.8 238.7 L 159.8 231.7 L 157.8 223.7 L 154.8 212.7 L 152.8 203.7 L 151.8 196.7 L 147.8 183.7 L 146.8 179.7 L 144.8 171.7 L 141.8 164.7 L 141.8 163.7 L 142.8 161.7 L 143.8 161.7 L 144.8 159.7 L 144.8 157.7 L 146.8 156.7 L 148.8 156.7 L 153.8 156.7 L 156.8 155.7 L 159.8 155.7 L 161.8 156.7 L 164.8 156.7 L 166.8 157.7 L 168.8 159.7 L 170.8 160.7 L 173.8 160.7 L 177.8 160.7 L 180.8 159.7 L 182.8 159.7 L 187.8 159.7 L 190.8 159.7 L 192.8 162.7 L 194.8 162.7 L 196.8 161.7 L 197.8 159.7 L 199.8 157.7 L 201.8 156.7 L 201.8 170.7 L 197.8 173.7 L 197.8 176.7 L 198.8 177.7 L 196.8 180.7 L 194.8 184.7 L 192.8 188.7 L 191.8 193.7 L 195.8 213.7 L 197.8 223.7 L 199.8 228.7 L 201.8 234.7 L 203.8 240.7 L 204.8 245.7 L 207.8 256.7 L 208.8 261.7 L 210.8 265.7 L 212.8 273.7 L 213.8 277.7 L 217.8 288.7 L 219.8 296.7 L 221.8 302.7 L 223.8 310.7 Z"
            	id="NV"
            	fill={stateColors.NV ? stateColors.NV.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('NV')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'NV' ? 'hovered' : ''}`}
            	/>

            	{/* New Hampshire */}
            	<path
            	d="M 830.5 158.1 L 830.5 160.1 L 832.5 163.1 L 834.5 166.1 L 834.5 170.1 L 832.5 172.1 L 832.5 177.1 L 831.5 180.1 L 833.5 180.1 L 836.5 176.1 L 838.5 173.1 L 842.5 173.1 L 844.5 171.1 L 844.5 165.1 L 845.5 163.1 L 844.5 159.1 L 844.5 155.1 L 841.5 153.1 L 839.5 151.1 L 836.5 151.1 L 833.5 152.1 L 830.5 154.1 Z M 825.6 135.2 L 825.6 137.2 L 823.6 138.2 L 822.6 138.2 L 824.6 139.2 L 825.6 140.2 L 826.6 140.2 L 826.6 142.2 L 825.6 143.2 L 825.6 145.2 L 824.6 149.2 L 824.6 151.2 L 826.6 152.2 L 826.6 154.2 L 823.6 156.2 L 823.6 158.2 L 821.6 159.2 L 820.6 160.2 L 819.6 159.2 L 817.6 159.2 L 816.6 156.2 L 816.6 153.2 L 817.6 148.2 L 819.6 146.2 L 819.6 145.2 L 818.6 143.2 L 815.6 142.2 L 814.6 140.2 L 814.6 138.2 L 815.6 135.2 L 817.6 134.2 L 821.6 134.2 L 823.6 135.2 Z"
            	id="NH"
            	fill={stateColors.NH ? stateColors.NH.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('NH')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'NH' ? 'hovered' : ''}`}
            	/>

            	{/* New Jersey */}
            	<path
            	d="M 800.4 230.9 L 799.4 232.9 L 797.4 232.9 L 795.4 233.9 L 794.4 236.9 L 793.4 238.9 L 793.4 240.9 L 791.4 242.9 L 789.4 243.9 L 789.4 245.9 L 786.4 246.9 L 785.4 245.9 L 784.4 242.9 L 781.4 239.9 L 779.4 237.9 L 778.4 233.9 L 776.4 231.9 L 776.4 229.9 L 777.4 227.9 L 776.4 225.9 L 775.4 223.9 L 774.4 220.9 L 771.4 219.9 L 770.4 217.9 L 770.4 215.9 L 771.4 213.9 L 771.4 211.9 L 774.4 210.9 L 777.4 211.9 L 781.4 212.9 L 784.4 214.9 L 786.4 213.9 L 787.4 211.9 L 789.4 211.9 L 791.4 210.9 L 791.4 209.9 L 791.4 207.9 L 792.4 205.9 L 791.4 203.9 L 791.4 201.9 L 793.4 199.9 L 795.4 199.9 L 797.4 197.9 L 800.4 197.9 L 802.4 200.9 L 803.4 202.9 L 803.4 212.9 L 801.4 218.9 L 802.4 220.9 L 800.4 221.9 L 799.4 224.9 L 799.4 228.9 Z"
            	id="NJ"
            	fill={stateColors.NJ ? stateColors.NJ.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('NJ')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'NJ' ? 'hovered' : ''}`}
            	/>

            	{/* New Mexico */}
            	<path
            	d="M 772.5 252.9 L 774.1 251.6 L 774.1 253.6 L 771.6 254.9 Z"
            	id="DC"
            	fill={stateColors.DC ? stateColors.DC.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('DC')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'DC' ? 'hovered' : ''}`}
            	/>

            	{/* New York */}
            	<path
            	d="M 783.8 183.9 L 785.8 187.9 L 783.8 191.9 L 783.8 194.9 L 786.8 195.9 L 789.8 195.9 L 791.8 197.9 L 793.8 197.9 L 793.8 199.9 L 792.8 202.9 L 793.8 204.9 L 793.8 207.9 L 792.8 210.9 L 789.8 213.9 L 787.8 215.9 L 785.8 215.9 L 783.8 214.9 L 782.8 213.9 L 780.8 211.9 L 776.8 212.9 L 776.8 214.9 L 773.8 217.9 L 770.8 217.9 L 769.8 214.9 L 766.8 212.9 L 762.8 210.9 L 758.8 209.9 L 755.8 207.9 L 754.8 205.9 L 754.8 202.9 L 753.8 199.9 L 753.8 197.9 L 750.8 194.9 L 748.8 193.9 L 747.8 194.9 L 746.8 191.9 L 747.8 188.9 L 747.8 186.9 L 744.8 184.9 L 739.8 184.9 L 736.8 185.9 L 730.8 186.9 L 726.8 189.9 L 725.8 189.9 L 725.8 186.9 L 723.8 183.9 L 720.8 182.9 L 719.8 181.9 L 718.8 179.9 L 717.8 178.9 L 717.8 176.9 L 719.8 175.9 L 719.8 174.9 L 718.8 173.9 L 717.8 171.9 L 717.8 169.9 L 719.8 169.9 L 722.8 170.9 L 725.8 172.9 L 728.8 172.9 L 731.8 172.9 L 735.8 170.9 L 739.8 168.9 L 743.8 166.9 L 747.8 165.9 L 751.8 165.9 L 754.8 166.9 L 757.8 166.9 L 760.8 164.9 L 762.8 162.9 L 765.8 161.9 L 768.8 161.9 L 771.8 160.9 L 774.8 160.9 L 777.8 160.9 L 780.8 160.9 L 782.8 160.9 L 786.8 160.9 L 788.8 163.9 L 790.8 164.9 L 793.8 164.9 L 794.8 163.9 L 797.8 162.9 L 799.8 161.9 L 799.8 159.9 L 801.8 159.9 L 803.8 161.9 L 804.8 163.9 L 807.8 165.9 L 811.8 166.9 L 814.8 166.9 L 817.8 164.9 L 819.8 161.9 L 821.8 160.9 L 821.8 159.9 L 819.8 158.9 L 816.8 156.9 L 813.8 154.9 L 813.8 152.9 L 816.8 151.9 L 816.8 150.9 L 814.8 147.9 L 814.8 146.9 L 816.8 145.9 L 818.8 144.9 L 818.8 143.9 L 817.8 142.9 L 815.8 141.9 L 814.8 139.9 L 813.8 138.9 L 813.8 137.9 L 812.8 136.9 L 812.8 134.9 L 813.8 134.9 L 815.8 134.9 L 816.8 133.9 L 816.8 132.9 L 814.8 131.9 L 812.8 131.9 L 811.8 129.9 L 810.8 127.9 L 811.8 126.9 L 811.8 125.9 L 808.8 126.9 L 805.8 126.9 L 802.8 127.9 L 799.8 128.9 L 796.8 131.9 L 791.8 133.9 L 789.8 136.9 L 788.8 138.9 L 784.8 140.9 L 780.8 140.9 L 778.8 139.9 L 779.8 138.9 L 779.8 136.9 L 780.8 136.9 L 781.8 136.9 L 781.8 135.9 L 778.8 133.9 L 776.8 132.9 L 777.8 131.9 L 778.8 129.9 L 778.8 127.9 L 779.8 125.9 L 778.8 124.9 L 774.8 123.9 L 771.8 122.9 L 772.8 121.9 L 774.8 121.9 L 776.8 120.9 L 776.8 118.9 L 774.8 117.9 L 771.8 116.9 L 771.8 115.9 L 773.8 114.9 L 774.8 112.9 L 774.8 107.9 L 775.8 105.9 L 777.8 104.9 L 778.8 102.9 L 778.8 100.9 L 776.8 99.9 L 774.8 99.9 L 773.8 98.9 L 773.8 97.9 L 776.8 97.9 L 779.8 97.9 L 781.8 97.9 L 783.8 99.9 L 785.8 100.9 L 786.8 100.9 L 787.8 99.9 L 786.8 95.9 L 788.8 94.9 L 791.8 96.9 L 795.8 99.9 L 796.8 102.9 L 794.8 104.9 L 794.8 106.9 L 798.8 107.9 L 798.8 109.9 L 796.8 112.9 L 796.8 116.9 L 795.8 119.9 L 797.8 121.9 L 797.8 124.9 L 795.8 126.9 L 790.8 127.9 L 789.8 130.9 L 788.8 132.9 L 786.8 134.9 L 785.8 137.9 L 785.8 138.9 L 787.8 139.9 L 790.8 141.9 L 793.8 144.9 L 795.8 146.9 L 798.8 148.9 L 800.8 149.9 L 802.8 151.9 L 802.8 153.9 L 803.8 157.9 L 804.8 159.9 L 807.8 161.9 L 808.8 164.9 L 810.8 167.9 L 815.8 170.9 L 819.8 173.9 L 820.8 177.9 L 820.8 180.9 L 819.8 182.9 L 814.8 182.9 L 810.8 181.9 L 807.8 180.9 L 805.8 179.9 L 802.8 179.9 L 801.8 181.9 L 799.8 181.9 L 798.8 179.9 L 795.8 178.9 L 790.8 179.9 L 788.8 181.9 L 787.8 183.9 Z"
            	id="NY"
            	fill={stateColors.NY ? stateColors.NY.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('NY')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'NY' ? 'hovered' : ''}`}
            	/>

            	{/* North Carolina */}
            	<path
            	d="M 731.8 342.1 L 728.8 341.1 L 722.8 339.1 L 714.8 335.1 L 708.8 334.1 L 701.8 334.1 L 694.8 334.1 L 686.8 333.1 L 682.8 333.1 L 677.8 333.1 L 674.8 334.1 L 668.8 335.1 L 663.8 337.1 L 659.8 338.1 L 653.8 339.1 L 652.8 338.1 L 649.8 338.1 L 647.8 341.1 L 643.8 344.1 L 640.8 346.1 L 637.8 347.1 L 634.8 347.1 L 633.8 348.1 L 631.8 351.1 L 631.8 354.1 L 631.8 356.1 L 636.8 355.1 L 643.8 353.1 L 647.8 350.1 L 651.8 350.1 L 654.8 350.1 L 658.8 349.1 L 664.8 349.1 L 667.8 349.1 L 669.8 352.1 L 671.8 354.1 L 676.8 355.1 L 680.8 355.1 L 683.8 356.1 L 687.8 356.1 L 691.8 356.1 L 693.8 357.1 L 698.8 359.1 L 701.8 360.1 L 704.8 359.1 L 707.8 356.1 L 710.8 354.1 L 713.8 354.1 L 715.8 356.1 L 717.8 358.1 L 723.8 354.1 L 725.8 353.1 L 725.8 351.1 L 724.8 349.1 L 723.8 346.1 L 726.8 344.1 L 729.8 344.1 L 731.8 342.1 Z"
            	id="NC"
            	fill={stateColors.NC ? stateColors.NC.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('NC')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'NC' ? 'hovered' : ''}`}
            	/>

            	{/* North Dakota */}
            	<path
            	d="M 473.1 114.4 L 473.1 156.4 L 475.1 156.4 L 504.1 156.4 L 504.1 113.4 L 501.1 113.4 L 500.1 111.4 L 496.1 108.4 L 491.1 107.4 L 482.1 106.4 L 474.1 106.4 L 473.1 112.4 Z"
            	id="ND"
            	fill={stateColors.ND ? stateColors.ND.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('ND')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'ND' ? 'hovered' : ''}`}
            	/>

            	{/* Ohio */}
            	<path
            	d="M 670.3 218.1 L 667.3 223.1 L 665.3 226.1 L 661.3 230.1 L 660.3 233.1 L 659.3 237.1 L 659.3 240.1 L 657.3 243.1 L 655.3 248.1 L 653.3 252.1 L 653.3 255.1 L 654.3 257.1 L 653.3 259.1 L 651.3 261.1 L 649.3 263.1 L 647.3 267.1 L 643.3 267.1 L 638.3 267.1 L 635.3 267.1 L 632.3 267.1 L 629.3 267.1 L 627.3 267.1 L 625.3 266.1 L 623.3 264.1 L 620.3 266.1 L 618.3 266.1 L 616.3 264.1 L 615.3 268.1 L 613.3 271.1 L 612.3 275.1 L 612.3 279.1 L 611.3 283.1 L 610.3 287.1 L 612.3 287.1 L 620.3 287.1 L 628.3 287.1 L 629.3 279.1 L 630.3 277.1 L 632.3 274.1 L 632.3 270.1 L 631.3 264.1 L 631.3 260.1 L 632.3 256.1 L 634.3 252.1 L 635.3 246.1 L 636.3 241.1 L 637.3 238.1 L 639.3 235.1 L 639.3 231.1 L 636.3 226.1 L 636.3 222.1 L 638.3 218.1 L 641.3 217.1 L 644.3 216.1 L 648.3 216.1 L 653.3 216.1 L 656.3 218.1 L 660.3 218.1 L 668.3 218.1 Z"
            	id="OH"
            	fill={stateColors.OH ? stateColors.OH.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('OH')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'OH' ? 'hovered' : ''}`}
            	/>

            	{/* Oklahoma */}
            	<path
            	d="M 462.1 329.8 L 462.1 334.8 L 461.1 340.8 L 459.1 348.8 L 457.1 352.8 L 457.1 358.8 L 459.1 363.8 L 458.1 367.8 L 459.1 372.8 L 458.1 375.8 L 420.1 375.8 L 383.1 373.8 L 383.1 369.8 L 380.1 369.8 L 377.1 368.8 L 377.1 364.8 L 375.1 362.8 L 375.1 359.8 L 376.1 357.8 L 375.1 354.8 L 372.1 353.8 L 370.1 354.8 L 368.1 353.8 L 367.1 350.8 L 370.1 350.8 L 370.1 347.8 L 369.1 345.8 L 369.1 342.8 L 369.1 339.8 L 367.1 337.8 L 364.1 336.8 L 363.1 333.8 L 359.1 331.8 L 359.1 328.8 L 359.1 325.8 L 387.1 325.8 L 415.1 327.8 L 445.1 328.8 L 451.1 328.8 L 456.1 328.8 L 460.1 329.8 Z"
            	id="OK"
            	fill={stateColors.OK ? stateColors.OK.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('OK')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'OK' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Oregon */}
            	<path
            	d="M 160.1 142.2 L 163.1 144.2 L 164.1 146.2 L 166.1 146.2 L 166.1 148.2 L 169.1 150.2 L 172.1 150.2 L 175.1 152.2 L 176.1 154.2 L 176.1 156.2 L 174.1 159.2 L 172.1 160.2 L 170.1 160.2 L 167.1 157.2 L 165.1 156.2 L 163.1 156.2 L 161.1 156.2 L 159.1 154.2 L 156.1 154.2 L 154.1 155.2 L 152.1 155.2 L 148.1 155.2 L 146.1 155.2 L 144.1 158.2 L 143.1 159.2 L 142.1 161.2 L 141.1 163.2 L 140.1 165.2 L 144.1 174.2 L 146.1 176.2 L 146.1 179.2 L 145.1 183.2 L 146.1 185.2 L 147.1 188.2 L 148.1 192.2 L 151.1 196.2 L 151.1 202.2 L 152.1 206.2 L 152.1 211.2 L 149.1 217.2 L 147.1 221.2 L 144.1 225.2 L 143.1 228.2 L 140.1 231.2 L 134.1 235.2 L 131.1 236.2 L 124.1 238.2 L 119.1 242.2 L 116.1 242.2 L 113.1 242.2 L 109.1 239.2 L 105.1 238.2 L 102.1 236.2 L 99.1 234.2 L 94.1 234.2 L 86.1 239.2 L 81.1 239.2 L 75.1 241.2 L 75.1 238.2 L 77.1 235.2 L 77.1 232.2 L 80.1 229.2 L 82.1 225.2 L 84.1 222.2 L 86.1 219.2 L 87.1 215.2 L 89.1 210.2 L 91.1 204.2 L 91.1 198.2 L 92.1 195.2 L 93.1 191.2 L 92.1 186.2 L 91.1 183.2 L 90.1 179.2 L 91.1 176.2 L 91.1 170.2 L 92.1 167.2 L 92.1 164.2 L 93.1 162.2 L 96.1 159.2 L 102.1 153.2 L 107.1 147.2 L 112.1 143.2 L 115.1 140.2 L 119.1 138.2 L 122.1 136.2 L 126.1 135.2 L 130.1 135.2 L 134.1 137.2 L 138.1 139.2 L 142.1 139.2 L 147.1 139.2 L 151.1 140.2 L 159.1 142.2 Z"
            	id="OR"
            	fill={stateColors.OR ? stateColors.OR.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('OR')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'OR' ? 'hovered' : ''}`}
            	/>

            	{/* Pennsylvania */}
            	<path
            	d="M 769.1 208.1 L 771.1 210.1 L 772.1 213.1 L 771.1 215.1 L 771.1 217.1 L 769.1 218.1 L 767.1 219.1 L 766.1 221.1 L 763.1 222.1 L 762.1 220.1 L 759.1 220.1 L 757.1 219.1 L 754.1 218.1 L 751.1 218.1 L 749.1 216.1 L 746.1 214.1 L 743.1 212.1 L 740.1 211.1 L 736.1 211.1 L 733.1 209.1 L 730.1 209.1 L 727.1 208.1 L 724.1 206.1 L 722.1 206.1 L 720.1 204.1 L 718.1 200.1 L 714.1 198.1 L 713.1 195.1 L 710.1 193.1 L 708.1 193.1 L 704.1 191.1 L 702.1 190.1 L 698.1 189.1 L 697.1 185.1 L 695.1 184.1 L 693.1 182.1 L 691.1 181.1 L 688.1 182.1 L 686.1 184.1 L 684.1 186.1 L 682.1 188.1 L 681.1 191.1 L 679.1 195.1 L 677.1 198.1 L 676.1 201.1 L 675.1 205.1 L 673.1 208.1 L 672.1 211.1 L 671.1 215.1 L 670.1 217.1 L 669.1 219.1 L 671.1 218.1 L 673.1 217.1 L 677.1 216.1 L 680.1 217.1 L 682.1 218.1 L 685.1 218.1 L 689.1 217.1 L 695.1 218.1 L 698.1 219.1 L 702.1 219.1 L 705.1 218.1 L 708.1 218.1 L 713.1 218.1 L 716.1 217.1 L 719.1 217.1 L 721.1 215.1 L 723.1 215.1 L 725.1 217.1 L 727.1 219.1 L 732.1 221.1 L 735.1 221.1 L 737.1 220.1 L 740.1 219.1 L 743.1 219.1 L 746.1 220.1 L 748.1 222.1 L 753.1 224.1 L 757.1 223.1 L 760.1 223.1 L 762.1 223.1 L 766.1 223.1 L 768.1 224.1 L 770.1 225.1 L 773.1 225.1 L 776.1 225.1 L 778.1 226.1 L 778.1 229.1 L 773.1 231.1 L 771.1 233.1 L 769.1 237.1 L 768.1 239.1 L 768.1 241.1 L 767.1 243.1 L 764.1 242.1 L 761.1 242.1 L 758.1 240.1 L 755.1 239.1 L 753.1 237.1 L 752.1 233.1 L 751.1 229.1 L 748.1 227.1 L 746.1 224.1 L 744.1 222.1 L 741.1 219.1 L 738.1 217.1 L 736.1 213.1 L 734.1 211.1 L 732.1 208.1 Z"
            	id="PA"
            	fill={stateColors.PA ? stateColors.PA.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('PA')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'PA' ? 'hovered' : ''}`}
            	/>

            	{/* Rhode Island */}
            	<path
            	d="M 823.4 174.8 L 822.4 178.8 L 821.4 180.8 L 819.4 182.8 L 819.4 184.8 L 820.4 187.8 L 822.4 189.8 L 824.4 192.8 L 824.4 194.8 L 822.4 194.8 L 820.4 192.8 L 818.4 190.8 L 817.4 187.8 L 816.4 183.8 L 815.4 181.8 L 814.4 178.8 L 812.4 175.8 L 811.4 172.8 L 809.4 171.8 L 809.4 169.8 L 811.4 171.8 L 813.4 171.8 L 814.4 170.8 L 817.4 170.8 L 819.4 172.8 L 821.4 174.8 Z"
            	id="RI"
            	fill={stateColors.RI ? stateColors.RI.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('RI')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'RI' ? 'hovered' : ''}`}
            	/>

            	{/* South Carolina */}
            	<path
            	d="M 710.8 358.1 L 708.8 360.1 L 708.8 363.1 L 706.8 365.1 L 703.8 367.1 L 699.8 369.1 L 695.8 371.1 L 692.8 371.1 L 689.8 369.1 L 686.8 368.1 L 685.8 366.1 L 685.8 362.1 L 684.8 360.1 L 681.8 359.1 L 677.8 357.1 L 675.8 356.1 L 673.8 354.1 L 672.8 351.1 L 668.8 350.1 L 665.8 349.1 L 663.8 348.1 L 661.8 347.1 L 662.8 346.1 L 665.8 343.1 L 667.8 341.1 L 670.8 338.1 L 674.8 336.1 L 677.8 335.1 L 681.8 334.1 L 686.8 334.1 L 689.8 335.1 L 692.8 335.1 L 695.8 335.1 L 699.8 335.1 L 704.8 336.1 L 709.8 337.1 L 713.8 337.1 L 717.8 339.1 L 721.8 340.1 L 724.8 342.1 L 727.8 343.1 L 724.8 345.1 L 722.8 347.1 L 724.8 350.1 L 725.8 352.1 L 724.8 354.1 L 722.8 356.1 L 719.8 356.1 L 717.8 356.1 L 715.8 354.1 L 713.8 354.1 Z"
            	id="SC"
            	fill={stateColors.SC ? stateColors.SC.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('SC')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'SC' ? 'hovered' : ''}`}
            	/>

            	{/* South Dakota */}
            	<path
            	d="M 472.6 169.9 L 471.6 171.9 L 471.6 175.9 L 471.6 178.9 L 471.6 183.9 L 471.6 196.9 L 471.6 200.9 L 471.6 202.9 L 471.6 204.9 L 473.6 208.9 L 475.6 212.9 L 478.6 214.9 L 481.6 216.9 L 485.6 216.9 L 488.6 217.9 L 489.6 215.9 L 492.6 214.9 L 493.6 211.9 L 495.6 211.9 L 497.6 211.9 L 499.6 211.9 L 500.6 210.9 L 504.6 211.9 L 506.6 211.9 L 508.6 211.9 L 509.6 212.9 L 514.6 212.9 L 516.6 213.9 L 519.6 213.9 L 520.6 214.9 L 521.6 215.9 L 521.6 217.9 L 520.6 219.9 L 519.6 222.9 L 519.6 224.9 L 520.6 228.9 L 522.6 231.9 L 521.6 233.9 L 503.6 233.9 L 485.6 232.9 L 472.6 231.9 L 472.6 208.9 L 471.6 202.9 L 470.6 198.9 L 470.6 191.9 L 470.6 185.9 L 470.6 181.9 L 470.6 173.9 L 471.6 170.9 Z"
            	id="SD"
            	fill={stateColors.SD ? stateColors.SD.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('SD')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'SD' ? 'hovered' : ''}`}
            	/>

            	{/* Tennessee */}
            	<path
            	d="M 648.6 333.8 L 645.6 333.8 L 641.6 333.8 L 638.6 335.8 L 634.6 337.8 L 630.6 337.8 L 627.6 339.8 L 624.6 339.8 L 620.6 340.8 L 617.6 339.8 L 614.6 337.8 L 611.6 336.8 L 608.6 335.8 L 604.6 335.8 L 600.6 335.8 L 596.6 335.8 L 592.6 334.8 L 588.6 334.8 L 586.6 335.8 L 584.6 335.8 L 581.6 335.8 L 579.6 335.8 L 577.6 336.8 L 575.6 337.8 L 572.6 337.8 L 569.6 336.8 L 568.6 336.8 L 565.6 335.8 L 562.6 333.8 L 559.6 331.8 L 557.6 335.8 L 552.6 336.8 L 550.6 335.8 L 548.6 335.8 L 547.6 334.8 L 546.6 333.8 L 549.6 333.8 L 553.6 332.8 L 555.6 332.8 L 560.6 332.8 L 564.6 332.8 L 568.6 332.8 L 572.6 332.8 L 577.6 332.8 L 579.6 332.8 L 584.6 332.8 L 590.6 331.8 L 594.6 330.8 L 598.6 330.8 L 600.6 330.8 L 603.6 327.8 L 606.6 327.8 L 608.6 325.8 L 611.6 324.8 L 613.6 322.8 L 616.6 320.8 L 619.6 317.8 L 623.6 316.8 L 625.6 313.8 L 627.6 312.8 L 629.6 309.8 L 633.6 309.8 L 635.6 307.8 L 639.6 306.8 L 644.6 303.8 L 649.6 303.8 L 653.6 304.8 L 654.6 307.8 L 655.6 311.8 L 653.6 315.8 L 651.6 319.8 L 648.6 320.8 L 645.6 322.8 L 641.6 323.8 L 638.6 325.8 L 636.6 326.8 L 634.6 328.8 L 633.6 331.8 L 631.6 333.8 L 629.6 335.8 L 629.6 339.8 L 636.6 338.8 L 640.6 337.8 L 644.6 335.8 L 647.6 335.8 L 649.6 333.8 Z"
            	id="TN"
            	fill={stateColors.TN ? stateColors.TN.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('TN')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'TN' ? 'hovered' : ''}`}
            	/>

            	{/* Texas */}
            	<path
            	d="M 285.7 308.7 L 285.7 307.7 L 360.7 316.7 L 358.7 340.7 L 358.7 355.7 L 358.7 371.7 L 358.7 383.7 L 358.7 389.7 L 357.7 392.7 L 354.7 392.7 L 352.7 394.7 L 351.7 397.7 L 350.7 401.7 L 348.7 405.7 L 345.7 405.7 L 343.7 407.7 L 343.7 409.7 L 345.7 411.7 L 348.7 413.7 L 351.7 415.7 L 352.7 418.7 L 353.7 420.7 L 357.7 421.7 L 359.7 421.7 L 363.7 419.7 L 366.7 419.7 L 371.7 421.7 L 375.7 422.7 L 379.7 424.7 L 383.7 424.7 L 385.7 425.7 L 389.7 425.7 L 391.7 424.7 L 394.7 426.7 L 397.7 429.7 L 399.7 431.7 L 403.7 433.7 L 407.7 434.7 L 408.7 436.7 L 412.7 437.7 L 416.7 439.7 L 419.7 439.7 L 421.7 441.7 L 425.7 444.7 L 427.7 446.7 L 429.7 447.7 L 432.7 447.7 L 435.7 447.7 L 438.7 450.7 L 441.7 451.7 L 443.7 453.7 L 444.7 456.7 L 444.7 459.7 L 445.7 462.7 L 447.7 464.7 L 450.7 465.7 L 453.7 464.7 L 456.7 461.7 L 458.7 458.7 L 459.7 457.7 L 461.7 455.7 L 463.7 453.7 L 465.7 448.7 L 464.7 445.7 L 464.7 442.7 L 465.7 438.7 L 467.7 435.7 L 469.7 432.7 L 470.7 429.7 L 468.7 425.7 L 467.7 421.7 L 467.7 416.7 L 466.7 413.7 L 464.7 407.7 L 462.7 402.7 L 460.7 398.7 L 459.7 394.7 L 458.7 390.7 L 458.7 385.7 L 458.7 379.7 L 459.7 375.7 Z"
            	id="TX"
            	fill={stateColors.TX ? stateColors.TX.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('TX')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'TX' ? 'hovered' : ''}`}
            	/>

            	{/* Utah */}
            	<path
            	d="M 257.8 315.8 L 237.8 312.8 L 220.8 308.8 L 223.8 287.8 L 227.8 258.8 L 230.8 235.8 L 248.8 239.8 L 267.8 243.8 L 286.8 247.8 L 283.8 270.8 L 280.8 291.8 L 278.8 302.8 L 274.8 302.8 L 266.8 302.8 L 258.8 302.8 L 257.8 303.8 L 257.8 309.8 Z"
            	id="UT"
            	fill={stateColors.UT ? stateColors.UT.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('UT')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'UT' ? 'hovered' : ''}`}
            	/>

            	{/* Vermont */}
            	<path
            	d="M 821.7 135.8 L 819.7 135.8 L 817.7 133.8 L 814.7 133.8 L 813.7 130.8 L 811.7 129.8 L 811.7 127.8 L 809.7 124.8 L 808.7 122.8 L 808.7 119.8 L 806.7 116.8 L 805.7 114.8 L 805.7 111.8 L 804.7 108.8 L 802.7 105.8 L 802.7 103.8 L 804.7 102.8 L 806.7 103.8 L 808.7 106.8 L 809.7 108.8 L 812.7 109.8 L 814.7 110.8 L 817.7 112.8 L 818.7 114.8 L 819.7 118.8 L 820.7 120.8 L 821.7 123.8 L 823.7 127.8 L 823.7 130.8 L 823.7 132.8 L 821.7 134.8 Z M 825.5 134.5 L 826.5 136.5 L 824.5 138.5 L 823.5 140.5 L 823.5 145.5 L 825.5 148.5 L 825.5 150.5 L 823.5 151.5 L 823.5 155.5 L 824.5 156.5 L 824.5 158.5 L 819.5 158.5 L 815.5 157.5 L 815.5 152.5 L 816.5 147.5 L 816.5 144.5 L 814.5 143.5 L 813.5 141.5 L 813.5 137.5 L 815.5 135.5 L 819.5 133.5 L 823.5 133.5 Z"
            	id="VT"
            	fill={stateColors.VT ? stateColors.VT.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('VT')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'VT' ? 'hovered' : ''}`}
            	/>

            	{/* Virginia */}
            	<path
            	d="M 737.7 240.8 L 736.7 243.8 L 738.7 246.8 L 738.7 250.8 L 740.7 253.8 L 742.7 256.8 L 745.7 258.8 L 748.7 259.8 L 750.7 263.8 L 752.7 265.8 L 754.7 268.8 L 757.7 270.8 L 759.7 272.8 L 762.7 275.8 L 764.7 278.8 L 766.7 282.8 L 767.7 286.8 L 769.7 290.8 L 770.7 294.8 L 773.7 297.8 L 776.7 298.8 L 779.7 298.8 L 778.7 302.8 L 775.7 304.8 L 772.7 306.8 L 771.7 309.8 L 769.7 311.8 L 766.7 315.8 L 763.7 317.8 L 761.7 318.8 L 759.7 317.8 L 757.7 316.8 L 755.7 315.8 L 753.7 314.8 L 751.7 313.8 L 748.7 313.8 L 746.7 314.8 L 743.7 314.8 L 741.7 313.8 L 738.7 315.8 L 735.7 318.8 L 732.7 320.8 L 730.7 324.8 L 728.7 326.8 L 724.7 327.8 L 721.7 330.8 L 718.7 332.8 L 717.7 335.8 L 714.7 335.8 L 711.7 335.8 L 707.7 334.8 L 703.7 334.8 L 699.7 334.8 L 697.7 333.8 L 693.7 333.8 L 689.7 333.8 L 686.7 332.8 L 683.7 332.8 L 677.7 332.8 L 674.7 333.8 L 672.7 335.8 L 669.7 336.8 L 665.7 338.8 L 662.7 338.8 L 656.7 339.8 L 653.7 338.8 L 650.7 338.8 L 648.7 337.8 L 647.7 335.8 L 645.7 334.8 L 644.7 332.8 L 644.7 330.8 L 643.7 327.8 L 640.7 326.8 L 639.7 324.8 L 639.7 321.8 L 639.7 318.8 L 642.7 316.8 L 645.7 317.8 L 649.7 319.8 L 653.7 319.8 L 655.7 316.8 L 657.7 314.8 L 659.7 312.8 L 661.7 311.8 L 660.7 309.8 L 660.7 307.8 L 660.7 304.8 L 660.7 301.8 L 661.7 300.8 L 664.7 298.8 L 666.7 296.8 L 670.7 294.8 L 674.7 293.8 L 677.7 292.8 L 679.7 291.8 L 682.7 289.8 L 686.7 288.8 L 689.7 289.8 L 692.7 290.8 L 695.7 292.8 L 697.7 294.8 L 701.7 296.8 L 705.7 295.8 L 708.7 293.8 L 712.7 292.8 L 715.7 290.8 L 718.7 289.8 L 723.7 287.8 L 727.7 284.8 L 731.7 280.8 L 734.7 277.8 L 738.7 272.8 L 741.7 267.8 L 742.7 262.8 L 744.7 257.8 L 745.7 253.8 L 743.7 249.8 L 741.7 246.8 L 739.7 243.8 L 738.7 240.8 Z"
            	id="VA"
            	fill={stateColors.VA ? stateColors.VA.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('VA')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'VA' ? 'hovered' : ''}`}
            	/>
           	 
            	{/* Washington */}
            	<path
            	d="M 161.1 83.6 L 159.1 88.6 L 157.1 91.6 L 154.1 92.6 L 152.1 95.6 L 150.1 97.6 L 149.1 100.6 L 149.1 103.6 L 146.1 103.6 L 143.1 105.6 L 139.1 104.6 L 137.1 102.6 L 134.1 102.6 L 132.1 100.6 L 130.1 99.6 L 128.1 97.6 L 125.1 96.6 L 123.1 94.6 L 121.1 91.6 L 121.1 88.6 L 120.1 86.6 L 120.1 83.6 L 117.1 82.6 L 114.1 81.6 L 112.1 79.6 L 110.1 75.6 L 108.1 74.6 L 105.1 71.6 L 103.1 69.6 L 101.1 67.6 L 101.1 64.6 L 101.1 62.6 L 102.1 60.6 L 105.1 58.6 L 108.1 56.6 L 110.1 54.6 L 113.1 54.6 L 116.1 53.6 L 119.1 52.6 L 122.1 51.6 L 124.1 51.6 L 127.1 50.6 L 130.1 50.6 L 133.1 50.6 L 135.1 51.6 L 138.1 50.6 L 140.1 50.6 L 143.1 49.6 L 145.1 49.6 L 148.1 49.6 L 151.1 49.6 L 154.1 48.6 L 158.1 48.6 L 160.1 50.6 L 164.1 52.6 L 167.1 55.6 L 170.1 57.6 L 172.1 58.6 L 173.1 61.6 L 175.1 64.6 L 177.1 67.6 L 179.1 70.6 L 182.1 71.6 L 182.1 74.6 L 182.1 77.6 L 179.1 79.6 L 177.1 81.6 L 174.1 81.6 L 171.1 83.6 L 168.1 84.6 L 165.1 84.6 L 163.1 83.6 Z"
            	id="WA"
            	fill={stateColors.WA ? stateColors.WA.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('WA')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'WA' ? 'hovered' : ''}`}
            	/>

            	{/* West Virginia */}
            	<path
            	d="M 693.2 270.5 L 691.2 273.5 L 688.2 274.5 L 687.2 277.5 L 683.2 279.5 L 682.2 281.5 L 680.2 285.5 L 677.2 286.5 L 675.2 289.5 L 673.2 290.5 L 669.2 291.5 L 666.2 293.5 L 662.2 294.5 L 661.2 297.5 L 658.2 298.5 L 654.2 301.5 L 652.2 302.5 L 650.2 305.5 L 645.2 306.5 L 641.2 307.5 L 637.2 307.5 L 635.2 308.5 L 633.2 307.5 L 629.2 307.5 L 626.2 306.5 L 624.2 305.5 L 621.2 303.5 L 621.2 300.5 L 623.2 298.5 L 625.2 295.5 L 626.2 292.5 L 629.2 289.5 L 630.2 286.5 L 632.2 282.5 L 634.2 279.5 L 636.2 275.5 L 638.2 273.5 L 641.2 272.5 L 644.2 270.5 L 647.2 269.5 L 651.2 267.5 L 653.2 264.5 L 654.2 261.5 L 656.2 258.5 L 659.2 256.5 L 659.2 253.5 L 660.2 249.5 L 661.2 245.5 L 662.2 242.5 L 665.2 239.5 L 667.2 235.5 L 669.2 234.5 L 674.2 234.5 L 680.2 235.5 L 684.2 236.5 L 687.2 239.5 L 689.2 241.5 L 692.2 243.5 L 693.2 246.5 L 695.2 249.5 L 695.2 252.5 L 697.2 256.5 L 697.2 261.5 L 696.2 265.5 L 695.2 268.5 Z"
            	id="WV"
            	fill={stateColors.WV ? stateColors.WV.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('WV')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'WV' ? 'hovered' : ''}`}
            	/>

            	{/* Wisconsin */}
            	<path
            	d="M 567.9 162.9 L 568.9 166.9 L 570.9 168.9 L 572.9 171.9 L 575.9 175.9 L 579.9 179.9 L 580.9 182.9 L 580.9 185.9 L 582.9 189.9 L 584.9 191.9 L 586.9 195.9 L 588.9 198.9 L 590.9 200.9 L 590.9 202.9 L 591.9 204.9 L 593.9 204.9 L 595.9 207.9 L 599.9 208.9 L 601.9 210.9 L 601.9 214.9 L 598.9 217.9 L 597.9 220.9 L 597.9 224.9 L 596.9 229.9 L 595.9 232.9 L 594.9 235.9 L 593.9 242.9 L 589.9 244.9 L 587.9 246.9 L 586.9 248.9 L 586.9 251.9 L 585.9 254.9 L 584.9 258.9 L 582.9 261.9 L 579.9 263.9 L 576.9 263.9 L 571.9 266.9 L 568.9 267.9 L 565.9 267.9 L 561.9 269.9 L 558.9 269.9 L 554.9 268.9 L 553.9 265.9 L 551.9 262.9 L 552.9 257.9 L 554.9 255.9 L 556.9 252.9 L 557.9 249.9 L 558.9 245.9 L 558.9 241.9 L 558.9 239.9 L 558.9 236.9 L 556.9 234.9 L 555.9 232.9 L 553.9 228.9 L 551.9 226.9 L 551.9 224.9 L 551.9 221.9 L 551.9 218.9 L 551.9 215.9 L 551.9 212.9 L 554.9 210.9 L 558.9 208.9 L 562.9 208.9 L 567.9 207.9 L 571.9 208.9 L 574.9 208.9 L 574.9 205.9 L 573.9 202.9 L 574.9 199.9 L 576.9 198.9 L 579.9 197.9 L 582.9 195.9 L 585.9 193.9 L 587.9 190.9 L 587.9 186.9 L 585.9 183.9 L 582.9 180.9 L 579.9 177.9 L 577.9 175.9 L 575.9 171.9 L 575.9 168.9 L 574.9 165.9 L 573.9 163.9 L 571.9 162.9 Z"
            	id="WI"
            	fill={stateColors.WI ? stateColors.WI.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('WI')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'WI' ? 'hovered' : ''}`}
            	/>

            	{/* Wyoming */}
            	<path
            	d="M 354.1 177.1 L 354.1 197.1 L 354.1 230.1 L 354.1 263.1 L 300.1 256.1 L 288.1 254.1 L 275.1 251.1 L 264.1 248.1 L 265.1 229.1 L 266.1 208.1 L 268.1 186.1 L 269.1 169.1 L 271.1 158.1 L 290.1 160.1 L 310.1 163.1 L 329.1 167.1 L 350.1 171.1 L 353.1 171.1 Z"
            	id="WY"
            	fill={stateColors.WY ? stateColors.WY.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('WY')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'WY' ? 'hovered' : ''}`}
            	/>

            	{/* DC */}
            	<path
            	d="M 772.5 252.9 L 774.1 251.6 L 774.1 253.6 L 771.6 254.9 Z"
            	id="DC"
            	fill={stateColors.DC ? stateColors.DC.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('DC')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'DC' ? 'hovered' : ''}`}
            	/>

            	{/* Georgia */}
            	<path
            	d="M 642.8 353.6 L 644.8 350.6 L 648.8 348.6 L 651.8 349.6 L 654.8 350.6 L 658.8 349.6 L 661.8 348.6 L 664.8 348.6 L 667.8 348.6 L 669.8 349.6 L 670.8 351.6 L 673.8 352.6 L 677.8 355.6 L 680.8 355.6 L 683.8 355.6 L 686.8 356.6 L 688.8 359.6 L 690.8 361.6 L 693.8 361.6 L 693.8 364.6 L 693.8 366.6 L 693.8 369.6 L 693.8 371.6 L 692.8 372.6 L 689.8 371.6 L 687.8 369.6 L 684.8 368.6 L 683.8 365.6 L 683.8 362.6 L 681.8 361.6 L 678.8 359.6 L 676.8 358.6 L 673.8 357.6 L 669.8 356.6 L 667.8 352.6 L 665.8 349.6 L 663.8 349.6 L 660.8 349.6 L 657.8 349.6 L 654.8 351.6 L 652.8 354.6 L 652.8 356.6 L 650.8 360.6 L 650.8 363.6 L 649.8 366.6 L 646.8 368.6 L 645.8 372.6 L 644.8 375.6 L 642.8 375.6 L 639.8 377.6 L 636.8 378.6 L 635.8 381.6 L 635.8 383.6 L 634.8 386.6 L 633.8 389.6 L 631.8 391.6 L 628.8 393.6 L 627.8 396.6 L 626.8 398.6 L 626.8 401.6 L 625.8 405.6 L 622.8 406.6 L 620.8 407.6 L 617.8 407.6 L 616.8 409.6 L 615.8 412.6 L 615.8 414.6 L 614.8 417.6 L 611.8 419.6 L 609.8 420.6 L 607.8 421.6 L 607.8 423.6 L 606.8 426.6 L 605.8 430.6 L 605.8 433.6 L 605.8 436.6 L 606.8 438.6 L 607.8 441.6 L 610.8 441.6 L 613.8 439.6 L 617.8 438.6 L 621.8 438.6 L 625.8 438.6 L 629.8 438.6 L 632.8 435.6 L 634.8 432.6 L 638.8 431.6 L 639.8 427.6 L 642.8 423.6 L 644.8 420.6 L 646.8 415.6 L 649.8 411.6 L 650.8 407.6 L 652.8 403.6 L 654.8 396.6 L 656.8 391.6 L 658.8 387.6 L 662.8 381.6 L 665.8 377.6 L 668.8 373.6 L 671.8 368.6 L 673.8 364.6 L 674.8 361.6 L 673.8 359.6 L 671.8 356.6 L 667.8 353.6 L 663.8 352.6 L 657.8 352.6 L 651.8 350.6 L 647.8 352.6 L 642.8 353.6 Z"
            	id="GA"
            	fill={stateColors.GA ? stateColors.GA.color : '#D3D3D3'}
            	onMouseEnter={() => handleStateMouseEnter('GA')}
            	onMouseLeave={handleStateMouseLeave}
            	className={`state-path ${hoveredState === 'GA' ? 'hovered' : ''}`}
            	/>

                
                {/* Include all other state paths from your original RegionalData.js */}
                {/* For brevity, they are not included here */}
                
              </svg>
            </div>
            <div className="state-info-panel">
              {hoveredState ? renderStateInfo() : (
                <div className="default-info">
                  <h3>Hover over a state to view details</h3>
                  <p>Currently displaying: {getIndicatorName(selectedIndicator)}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'comparison':
        return (
          <div className="enhanced-analysis-container">
            <EnhancedRegionalAnalysis 
              selectedIndicator={selectedIndicator}
              statesData={statesData}
            />
          </div>
        );
      
      case 'trends':
        return (
          <div className="trends-container">
            <StateTrendComparison selectedIndicator={selectedIndicator} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="regional-data indicator-page">
      <h2>Regional Economic Data</h2>
      
      <div className="controls">
        <div className="selector">
          <label htmlFor="indicator-select">Select Indicator: </label>
          <select 
            id="indicator-select" 
            value={selectedIndicator} 
            onChange={handleIndicatorChange}
          >
            {indicators.map(indicator => (
              <option key={indicator.id} value={indicator.id}>
                {indicator.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {renderTabs()}
      
      {loading ? (
        <div className="loading">Loading regional data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="regional-content">
          {renderActiveContent()}
          
          {activeTab === 'map' && (
            <div className="legend">
              <h3>Legend</h3>
              <div className="legend-item">
                {selectedIndicator === 'UNRATE' ? (
                  <>
                    <div className="legend-color" style={{ background: 'rgb(0, 255, 0)' }}></div>
                    <span>Low Unemployment</span>
                    <div className="legend-color" style={{ background: 'rgb(255, 0, 0)' }}></div>
                    <span>High Unemployment</span>
                  </>
                ) : (
                  <>
                    <div className="legend-color" style={{ background: 'rgb(0, 255, 0)' }}></div>
                    <span>High {selectedIndicator === 'MSPUS' ? 'House Prices' : 'Income'}</span>
                    <div className="legend-color" style={{ background: 'rgb(255, 0, 0)' }}></div>
                    <span>Low {selectedIndicator === 'MSPUS' ? 'House Prices' : 'Income'}</span>
                  </>
                )}
                <div className="legend-color" style={{ background: '#D3D3D3' }}></div>
                <span>No Data</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegionalData;