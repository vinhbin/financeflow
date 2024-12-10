// src/components/Statistics.js
import React, { useEffect, useState, useMemo, useRef } from 'react';
import './Statistics.css'; // Import the CSS specific to Statistics
import api from '../utils/api';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import Spinner from './Spinner'; // Import your existing Spinner component
import useAuth from '../hooks/useAuth'; // Ensure useAuth is imported
import Card from './Card'; // Import the Card component for consistent styling
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InputMask from 'react-input-mask';
import CalendarIcon from './CalendarIcon'; // Import the new CalendarIcon component
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const Statistics = () => {
  const { userID } = useAuth(); // Assuming useAuth provides userID
  const navigate = useNavigate(); // Initialize navigate
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: null, // Change to Date object
    endDate: null,   // Change to Date object
    category: 'All',
    presetRange: 'Custom',
  });

  // Define activeIndex state for Pie Chart hover effect
  const [activeIndex, setActiveIndex] = useState(null);

  // Refs for DatePickers
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      console.log('Statistics Page: Fetching transactions...');
      try {
        const response = await api.get(`/api/plaid/transactions/${userID}`);
        console.log('Statistics Page: Transactions fetched successfully.', response.data.transactions);
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (err) {
        console.error('Statistics Page: Error fetching transactions:', err.response?.data || err.message);
        setError('Failed to fetch transactions.');
        toast.error('Failed to fetch transactions.');
        setLoading(false);
      }
      console.log('Statistics Page: Fetching transactions completed.\n'); // Adds a line break
    };

    if (userID) {
      fetchTransactions();
    } else {
      console.log('Statistics Page: No userID found.');
    }
  }, [userID]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(`Statistics Page: Filter changed - ${name}: ${value}\n`); // Logs filter changes with identifier
  };

  // Handle date changes
  const handleStartDateChange = (date) => {
    setFilter((prev) => ({
      ...prev,
      startDate: date,
      presetRange: 'Custom',
    }));
    console.log(`Statistics Page: Start Date filter set to ${date}\n`);
  };

  const handleEndDateChange = (date) => {
    setFilter((prev) => ({
      ...prev,
      endDate: date,
      presetRange: 'Custom',
    }));
    console.log(`Statistics Page: End Date filter set to ${date}\n`);
  };

  // Helper functions for date formatting and parsing
  const formatDate = (date) => {
    if (!date) return '';
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  
  const parseDate = (value) => {
    const [month, day, year] = value.split('/');
    if (month && day && year) {
      const parsedDate = new Date(`${year}-${month}-${day}`);
      if (!isNaN(parsedDate)) {
        return parsedDate;
      }
    }
    return null;
  };

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    console.log('Statistics Page: Applying filters to transactions...');
    const result = transactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      const startDate = filter.startDate ? new Date(filter.startDate) : null;
      const endDate = filter.endDate ? new Date(filter.endDate) : null;
      const category = filter.category;

      const withinStartDate = startDate ? txnDate >= startDate : true;
      const withinEndDate = endDate ? txnDate <= endDate : true;
      const matchesCategory = category === 'All' ? true : txn.category === category;

      return withinStartDate && withinEndDate && matchesCategory;
    });
    console.log('Statistics Page: Filtered Transactions:', result, '\n');
    return result;
  }, [transactions, filter]);

  // Prepare data for Line Chart (Expenses Over Time)
  const prepareLineChartData = () => {
    const expensesOverTime = {};
    filteredTransactions.forEach((txn) => {
      const date = new Date(txn.date);
      const month = `${date.getMonth() + 1}/${date.getFullYear()}`; // Format: MM/YYYY
      const amount = parseFloat(txn.amount);
      if (amount > 0) { // Assuming positive amounts are expenses
        expensesOverTime[month] = (expensesOverTime[month] || 0) + amount;
      }
    });

    const sortedMonths = Object.keys(expensesOverTime).sort(
      (a, b) => {
        const [monthA, yearA] = a.split('/').map(Number);
        const [monthB, yearB] = b.split('/').map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      }
    );

    return sortedMonths.map((month) => ({
      month,
      expenses: expensesOverTime[month],
    }));
  };

  // Prepare data for Pie Chart (Expenses by Category)
  const preparePieChartData = () => {
    const expensesByCategory = {};
    filteredTransactions.forEach((txn) => {
      const amount = parseFloat(txn.amount);
      if (amount > 0) { // Assuming positive amounts are expenses
        const category = txn.category || 'Uncategorized';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
      }
    });

    return Object.keys(expensesByCategory).map((category) => ({
      name: category,
      value: expensesByCategory[category],
    }));
  };

  // Prepare data for Bar Chart (Transactions per Category)
  const prepareBarChartData = () => {
    const transactionsPerCategory = {};
    filteredTransactions.forEach((txn) => {
      const amount = parseFloat(txn.amount);
      if (amount > 0) { // Assuming positive amounts are expenses
        const category = txn.category || 'Uncategorized';
        transactionsPerCategory[category] = (transactionsPerCategory[category] || 0) + 1;
      }
    });

    return Object.keys(transactionsPerCategory).map((category) => ({
      category,
      count: transactionsPerCategory[category],
    }));
  };

  // Prepare data for Cumulative Expenses Over Time (Line Chart)
  const prepareAreaChartData = () => {
    const cumulativeExpenses = [];
    let total = 0;
    const sortedData = prepareLineChartData(); // Already sorted in prepareLineChartData

    sortedData.forEach((dataPoint) => {
      total += dataPoint.expenses;
      cumulativeExpenses.push({
        month: dataPoint.month,
        cumulativeExpenses: total,
      });
    });

    return cumulativeExpenses;
  };

  // Define colors for Pie Chart
  const pieColors = [
    '#e74c3c',
    '#3498db',
    '#2ecc71',
    '#f1c40f',
    '#9b59b6',
    '#34495e',
    '#16a085',
    '#d35400',
    '#7f8c8d',
    '#2980b9',
    // Add more colors as needed
  ];

  // Define color for Area Chart
  const areaColor = '#f39c12'; // Orange color

  // Memoize chart data to optimize performance
  const memoizedLineChartData = useMemo(() => prepareLineChartData(), [filteredTransactions]);
  const memoizedPieChartData = useMemo(() => preparePieChartData(), [filteredTransactions]);
  const memoizedBarChartData = useMemo(() => prepareBarChartData(), [filteredTransactions]);
  const memoizedAreaChartData = useMemo(() => prepareAreaChartData(), [memoizedLineChartData]);

  // Helper function to format legend labels
  const formatLegendLabel = (value) => {
    // Insert spaces before capital letters (if camelCase or PascalCase)
    const spacedValue = value.replace(/([A-Z])/g, ' $1').trim();

    // Capitalize the first letter
    return spacedValue.charAt(0).toUpperCase() + spacedValue.slice(1);
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Determine if it's a Pie Chart based on payload structure
      const isPieChart = payload[0].name && payload[0].value !== undefined && payload[0].payload !== undefined && payload[0].payload.name;

      if (isPieChart) {
        // Calculate total for percentage
        const total = memoizedPieChartData.reduce((acc, cur) => acc + cur.value, 0);
        const currentValue = payload[0].value;
        const percentage = ((currentValue / total) * 100).toFixed(2);
        return (
          <div className="custom-tooltip">
            <p className="label"><strong>Category: {payload[0].name}</strong></p>
            <p className="desc">Percentage: {percentage}%</p>
            <p className="desc">Amount: ${currentValue.toLocaleString()}</p>
          </div>
        );
      } else {
        // For Line and Bar Charts
        return (
          <div className="custom-tooltip">
            <p className="label"><strong>{label}</strong></p>
            {payload.map((entry, index) => (
              <div key={`tooltip-item-${index}`}>
                <p className="desc">
                  {formatLegendLabel(entry.name)}: ${entry.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        );
      }
    }

    return null;
  };

  // Lazy loading charts using Intersection Observer
  const { ref: lineChartRef, inView: lineChartInView } = useInView({ triggerOnce: true });
  const { ref: pieChartRef, inView: pieChartInView } = useInView({ triggerOnce: true });
  const { ref: barChartRef, inView: barChartInView } = useInView({ triggerOnce: true });
  const { ref: areaChartRef, inView: areaChartInView } = useInView({ triggerOnce: true });

  if (loading) {
    return (
      <motion.div
        className="statistics-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Spinner /> {/* Use your existing Spinner component */}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="statistics-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="error-message">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="statistics-page"
      initial={{ x: 1000, opacity: 0 }} // Start off-screen to the right
      animate={{ x: 0, opacity: 1 }}   // Slide into view
      exit={{ x: 1000, opacity: 0 }}   // Slide out to the right
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Header Section */}
      <div className="statistics-header">
        {/* Stylish Back Button */}
        <motion.button
          className="back-button"
          onClick={() => navigate('/dashboard')} // Navigate back to Dashboard
          aria-label="Back to Dashboard"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* SVG Left Arrow Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
        <h2>Statistics</h2>
      </div>

      {/* Scrollable Content Section */}
      <div className="statistics-content">
        {/* Filter Section */}
        <div className="filter-container">
          <div className="filter-item">
            <label htmlFor="presetRange">Date Range:</label>
            <select
              id="presetRange"
              name="presetRange"
              value={filter.presetRange}
              onChange={(e) => {
                const value = e.target.value;
                let startDate = null;
                let endDate = null;
                const today = new Date();
                const priorDate = new Date();

                switch (value) {
                  case 'Last7Days':
                    priorDate.setDate(today.getDate() - 7);
                    startDate = new Date(priorDate);
                    endDate = new Date(today);
                    break;
                  case 'Last14Days':
                    priorDate.setDate(today.getDate() - 14);
                    startDate = new Date(priorDate);
                    endDate = new Date(today);
                    break;
                  case 'Last3Months':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                    endDate = new Date(today);
                    break;
                  case 'Last6Months':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
                    endDate = new Date(today);
                    break;
                  case 'ThisMonth':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today);
                    break;
                  case 'LastMonth':
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
                    endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
                    break;
                  default:
                    break;
                }

                setFilter((prev) => ({
                  ...prev,
                  startDate,
                  endDate,
                  presetRange: value,
                }));
                console.log(`Statistics Page: Date Range filter set to ${value}\n`);
              }}
            >
              <option value="Custom">Custom</option>
              <option value="Last7Days">Last 7 Days</option>
              <option value="Last14Days">Last 14 Days</option>
              <option value="Last3Months">Last 3 Months</option>
              <option value="Last6Months">Last 6 Months</option>
              <option value="ThisMonth">This Month</option>
              <option value="LastMonth">Last Month</option>
            </select>
          </div>
          {filter.presetRange === 'Custom' && (
            <>
              <div className="filter-item">
                <label htmlFor="startDate">Start Date:</label>
                <div className="date-picker-wrapper">
                  <InputMask
                    mask="99/99/9999"
                    value={filter.startDate ? formatDate(filter.startDate) : ''}
                    onChange={(e) => {
                      const date = parseDate(e.target.value);
                      handleStartDateChange(date);
                    }}
                    placeholder="MM/DD/YYYY"
                    className="custom-date-picker"
                  />
                  <button
                    type="button"
                    className="calendar-button"
                    onClick={() => {
                      // Open the start date picker
                      if (startDatePickerRef.current) {
                        startDatePickerRef.current.setOpen(true);
                      }
                    }}
                    aria-label="Open Start Date Calendar"
                  >
                    <CalendarIcon /> {/* Use the new CalendarIcon */}
                  </button>
                  <DatePicker
                    ref={startDatePickerRef}
                    selected={filter.startDate}
                    onChange={handleStartDateChange}
                    dateFormat="MM/dd/yyyy"
                    className="hidden-datepicker"
                    placeholderText="Select start date"
                  />
                </div>
              </div>
              <div className="filter-item">
                <label htmlFor="endDate">End Date:</label>
                <div className="date-picker-wrapper">
                  <InputMask
                    mask="99/99/9999"
                    value={filter.endDate ? formatDate(filter.endDate) : ''}
                    onChange={(e) => {
                      const date = parseDate(e.target.value);
                      handleEndDateChange(date);
                    }}
                    placeholder="MM/DD/YYYY"
                    className="custom-date-picker"
                  />
                  <button
                    type="button"
                    className="calendar-button"
                    onClick={() => {
                      // Open the end date picker
                      if (endDatePickerRef.current) {
                        endDatePickerRef.current.setOpen(true);
                      }
                    }}
                    aria-label="Open End Date Calendar"
                  >
                    <CalendarIcon /> {/* Use the new CalendarIcon */}
                  </button>
                  <DatePicker
                    ref={endDatePickerRef}
                    selected={filter.endDate}
                    onChange={handleEndDateChange}
                    dateFormat="MM/dd/yyyy"
                    className="hidden-datepicker"
                    placeholderText="Select end date"
                  />
                </div>
              </div>
            </>
          )}
          <div className="filter-item">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {Array.from(new Set(transactions.map(txn => txn.category))).map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-container">
          {/* Expenses Over Time - Line Chart */}
          <Card title="Expenses Over Time" className="chart-item" ref={lineChartRef}>
            {lineChartInView && memoizedLineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={memoizedLineChartData}>
                  <defs>
                    <linearGradient id="expensesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#e74c3c" stopOpacity={1}>
                        <animate attributeName="offset" values="0%;1" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="50%" stopColor="#f39c12" stopOpacity={1}>
                        <animate attributeName="offset" values="50%;1.5" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#e74c3c" stopOpacity={1}>
                        <animate attributeName="offset" values="1%;2" dur="3s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: '#ffffff' }} />
                  <YAxis tick={{ fill: '#ffffff' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => formatLegendLabel(value)} />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="url(#expensesGradient)"
                    strokeWidth={3} // Increased line thickness
                    activeDot={{ r: 8 }}
                    dot={{ fill: '#e74c3c', stroke: '#000000', strokeWidth: 1, r: 6, opacity: 0.5 }} // Default opacity set to 0.5
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No expense data available for the selected filters.</p>
            )}
          </Card>

          {/* Expenses by Category - Pie Chart */}
          <Card title="Expenses by Category" className="chart-item" ref={pieChartRef}>
            {pieChartInView && memoizedPieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={memoizedPieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150} /* Increased radius for better visibility */
                    fill="#8884d8"
                    activeIndex={activeIndex}
                    activeShape={(props) => <CustomizedActiveShape {...props} />}
                    onMouseEnter={(data, index) => {
                      setActiveIndex(index);
                    }}
                    onMouseLeave={() => {
                      setActiveIndex(null);
                    }}
                    // Remove label prop to eliminate labels on slices
                  >
                    {memoizedPieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => formatLegendLabel(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No expense data available for the selected filters.</p>
            )}
          </Card>

          {/* Transactions per Category - Bar Chart */}
          <Card title="Transactions per Category" className="chart-item" ref={barChartRef}>
            {barChartInView && memoizedBarChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={memoizedBarChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fill: '#ffffff' }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#ffffff' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => formatLegendLabel(value)} />
                  <Bar
                    dataKey="count"
                    fill="#ffffff"
                    activeFill="#ffffff" // Match active fill to regular fill to prevent fill change
                    activeStroke="#ffffff" // Highlight border on hover
                    stroke="#ffffff" // Regular stroke color
                  >
                    {memoizedBarChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No transaction data available for the selected filters.</p>
            )}
          </Card>

          {/* Cumulative Expenses Over Time - Line Chart */}
          <Card title="Cumulative Expenses Over Time" className="chart-item" ref={areaChartRef}>
            {areaChartInView && memoizedAreaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={memoizedAreaChartData}>
                  <defs>
                    <linearGradient id="cumulativeExpensesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={areaColor} stopOpacity={1}>
                        <animate attributeName="offset" values="0%;1" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="50%" stopColor="#ffffff" stopOpacity={1}>
                        <animate attributeName="offset" values="50%;1.5" dur="3s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor={areaColor} stopOpacity={1}>
                        <animate attributeName="offset" values="1%;2" dur="3s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: '#ffffff' }} />
                  <YAxis tick={{ fill: '#ffffff' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => formatLegendLabel(value)} />
                  <Line
                    type="monotone"
                    dataKey="cumulativeExpenses"
                    stroke="url(#cumulativeExpensesGradient)"
                    strokeWidth={3} // Increased line thickness
                    fill={areaColor}
                    fillOpacity={0.3}
                    activeDot={{ r: 8 }}
                    dot={{ fill: '#f39c12', stroke: '#000000', strokeWidth: 1, r: 6, opacity: 1 }} // Fully filled with black border and full opacity
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No expense data available for the selected filters.</p>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

// Customized Active Shape for Pie Chart Hover
const CustomizedActiveShape = (props) => {
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;

  // Calculate new outer radius for the pop-out effect
  const expandedOuterRadius = outerRadius + 10;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={expandedOuterRadius} /* Slightly larger to "pop out" */
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#ffffff" /* White border */
        strokeWidth={2} /* Border thickness */
      />
    </g>
  );
};

export default Statistics;
