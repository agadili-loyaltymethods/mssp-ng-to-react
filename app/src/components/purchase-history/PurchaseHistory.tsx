import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  TextField,
  IconButton,
  Collapse,
  Box,
  InputAdornment,
  Select,
  MenuItem,
  FormControl
} from '@material-ui/core';
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardArrowDown, KeyboardArrowUp, Refresh, FirstPage, LastPage, NavigateNext, NavigateBefore } from '@material-ui/icons';
import { useMemberService } from '../../hooks/useMemberService';
import { formatCurrency } from '../../utils/formatters';
import { NoData } from '../common/no-data/NoData';
import useAlertService from '@/hooks/useAlertService';
import { RefreshCw, Search } from 'lucide-react';

interface ExpandableRowProps {
  row: any;
  expanded: boolean;
  onExpand: () => void;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ row, expanded, onExpand }) => {
  return (
    <>
      <TableRow>
        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
        <TableCell>{row.type}</TableCell>
        <TableCell>{row.bookingId || '-'}</TableCell>
        <TableCell>{row.location?.name || '-'}</TableCell>
        <TableCell>{row.gaming ? 'Gaming' : row.desc}</TableCell>
        <TableCell>
          <div className="p-1 highlight">
            {row.spend ? formatCurrency(row.spend) : '-'}
          </div>
        </TableCell>
        <TableCell>
          <div className={`p-1 highlight ${row.total > 0 ? 'earns' :
            row.total < 0 ? 'spends' :
              'no-transactions'
            }`}>
            {row.total ? row.total.toLocaleString() : '-'}
          </div>
        </TableCell>
        <TableCell>
          {row.isExpandable && (
            <IconButton size="small" onClick={onExpand}>
              {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="p-0">
            <Collapse in={expanded}>
              <Box className="p-4">
                {/* Nested data rendering */}
                {row.nestedData?.length > 0 ? (
                  row.nestedData.map((data: any, index: number) => (
                    <div key={index} className="mb-4">
                      <h4>{data.title}</h4>
                      {/* Transaction details */}
                    </div>
                  ))
                ) : (
                  row.gaming ? (
                    <div>
                      <h4>Casino</h4>
                      {/* Gaming details */}
                    </div>
                  ) : (
                    <NoData>No transactions found.</NoData>
                  )
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

type Purse = {
  name: string;
  prev: number;
  new: number;
};

type HistoryItem = {
  date: string;
  ext?: {
    folioId?: string;
    lob?: string;
    gaming?: boolean;
  };
  location?: {
    name?: string;
  };
  result?: {
    data?: {
      desc?: string;
      purses?: Purse[];
    };
  };
  value: number;
  type: string;
  _id: string;
  lineItems: any[];
};

export const PurchaseHistory: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const memberInfo = useSelector((state: any) => state.member);
  const memberService = useMemberService();
  const alertService = useAlertService();
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredHistory = purchaseHistory.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate pagination values
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Pagination handlers
  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleFirstPageButtonClick = () => {
    setPage(0);
  };

  const handleBackButtonClick = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextButtonClick = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handleLastPageButtonClick = () => {
    setPage(Math.max(0, totalPages - 1));
  };

  useEffect(() => {
    if (memberInfo?._id) {
      getActivityHistory();
    }
  }, [memberInfo]);

  const getActivityHistory = async () => {
    try {
      const history = await memberService.getActivityHistory(memberInfo._id);
      const processedHistory = history
        .filter((item) => item.status === 'Processed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(formatHistory2);
      setPurchaseHistory(processedHistory);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHistory = (history: any) => {
    // History formatting logic here
    return {
      ...history,
      isExpandable: history.type === 'Accrual',
      expanded: false,
    };
  };

  const formatHistory2 = (history: any) => {
    const pointsValue = getTotalPurse(history.result?.data?.purses || []);
    return {
      date: history.date,
      bookingId: history?.ext?.folioId ?? '-',
      location: history?.location?.name ?? '-',
      desc: history.result?.data?.desc ?? '-',
      total: getPurseValue(history.result?.data?.purses || [], 'Status Points'),
      serviceStatusPoints: getPurseValue(history.result?.data?.purses || [], 'GCGC Status Points'),
      rewardUsed: pointsValue < 0 ? Math.abs(pointsValue) : 0,
      spend: history.value,
      basePoints: pointsValue,
      lob: history?.ext?.lob,
      type: history.type,
      value: history.value,
      id: history._id,
      isExpandable: history.type === 'Accrual',
      expanded: false,
      gaming: history?.ext?.gaming,
      lineItems: history.lineItems.map((item: any) => ({ ...item, lob: history?.ext?.lob })),
      summary: {}
    };
  };

  const getTotalPurse = (purses: Purse[], isStatus: boolean = false): number => {
    const selectedPurse = purses?.filter((purse) =>
      isStatus ? purse.name.includes('Status') : !purse.name.includes('Status')
    );
    if (selectedPurse?.length) {
      return selectedPurse.reduce((acc, purse) => (purse.new - purse.prev) + acc, 0);
    }
    return 0;
  };

  const getPurseValue = (purses: Purse[] = [], type: string): number => {
    const selectedPurse = purses.find((purse) => purse.name === type);
    return selectedPurse ? selectedPurse.new - selectedPurse.prev : 0;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] px-6 py-8 flex flex-col items-center">
      <div className="w-full">
        <div className="flex flex-col gap-10 mt-5">
          <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-md shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium text-gray-900">Activity History</h2>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <RefreshCw className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-3 pr-10 py-2 w-64 outline-none bg-transparent border-b border-gray-300 focus:border-b-2 focus:border-orange-500 focus:bg-gray-100 hover:border-b-2 hover:bg-gray-100 hover:border-orange-500 transition-all duration-200 focus:outline-none hover:outline-none active:outline-none focus:ring-0 focus:ring-offset-0"
                      style={{
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        outline: 'none'
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Activity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Folio #</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Details</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Total Spend</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status Points</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">SP Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHistory.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-900">{item.date}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{item.activity}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{item.folioNumber || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{item.location || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{item.details || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-900 text-right">
                              {item.totalSpend ? `$${item.totalSpend}` : '-'}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-sm ${item.statusPoints ? 'text-green-600' : 'text-gray-500'}`}>
                                {item.statusPoints || '-'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-sm text-gray-500">{item.spStatus || '-'}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`text-sm ${Number(item.points) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {Number(item.points) > 0 ? '+' : ''}{item.points || '-'}
                                </span>
                                {item.isExpandable && (
                                  <button
                                    onClick={() => toggleRow(item.id)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <span className={`transform transition-transform ${expandedRows[item.id] ? 'rotate-180' : ''}`}>
                                      ▼
                                    </span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {expandedRows[item.id] && (
                            <tr className="bg-gray-50">
                              <td colSpan={9} className="py-4 px-8">
                                <div className="grid grid-cols-2 gap-8">
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-4">Casino</h3>
                                    <div className="space-y-3">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Cash In</span>
                                        <span className="text-gray-900">${item.cashIn || '0.00'}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Cash Out</span>
                                        <span className="text-gray-900">${item.cashOut || '0.00'}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Wager Amount</span>
                                        <span className="text-gray-900">${item.wagerAmount || '0.00'}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Free Play Credit</span>
                                        <span className="text-gray-900">${item.freePlayCredit || '0.00'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-4">Session Details</h3>
                                    <div className="space-y-3">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Session Start Time</span>
                                        <span className="text-gray-900">{item.sessionStartTime}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Session End Time</span>
                                        <span className="text-gray-900">{item.sessionEndTime}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Component */}
                  <div className="flex items-center justify-end mt-6 px-4 py-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-4">Rows per page:</span>
                      <FormControl variant="outlined" size="small" className="mr-6">
                        <Select
                          value={rowsPerPage}
                          onChange={handleChangeRowsPerPage}
                          className="h-10 min-w-[80px]"
                          style={{ borderColor: '#e5e7eb', fontSize: '0.875rem' }}
                          MenuProps={{
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                          }}
                        >
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                        </Select>
                      </FormControl>

                      <span className="ml-4 mr-6">
                        {startIndex + 1} - {endIndex} of {totalItems}
                      </span>

                      <div className="flex items-center">
                        <IconButton
                          onClick={handleFirstPageButtonClick}
                          disabled={page === 0}
                          size="small"
                        >
                          <FirstPage fontSize="small" color={page === 0 ? "disabled" : "action"} />
                        </IconButton>
                        <IconButton
                          onClick={handleBackButtonClick}
                          disabled={page === 0}
                          size="small"
                        >
                          <NavigateBefore fontSize="small" color={page === 0 ? "disabled" : "action"} />
                        </IconButton>
                        <IconButton
                          onClick={handleNextButtonClick}
                          disabled={page >= totalPages - 1}
                          size="small"
                        >
                          <NavigateNext fontSize="small" color={page >= totalPages - 1 ? "disabled" : "action"} />
                        </IconButton>
                        <IconButton
                          onClick={handleLastPageButtonClick}
                          disabled={page >= totalPages - 1}
                          size="small"
                        >
                          <LastPage fontSize="small" color={page >= totalPages - 1 ? "disabled" : "action"} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};