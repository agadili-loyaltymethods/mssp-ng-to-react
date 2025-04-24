
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
  InputAdornment
} from '@material-ui/core';
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardArrowDown, KeyboardArrowUp, Refresh } from '@material-ui/icons';
import { useMemberService } from '../../hooks/useMemberService';
import { formatCurrency } from '../../utils/formatters';
import { NoData } from '../common/no-data/NoData';
import useAlertService from '@/hooks/useAlertService';

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
          <div className={`p-1 highlight ${
            row.total > 0 ? 'earns' :
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

  useEffect(() => {
    if (memberInfo?._id) {
      getActivityHistory();
    }
  }, [memberInfo]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  const filteredHistory = purchaseHistory.filter((item) => 
    Object.values(item).some((value) => 
      String(value).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Activity History</h1>
        <div className="flex items-center">
          <button className="mr-2">
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Activity</th>
              <th className="text-left py-3 px-4">Folio #</th>
              <th className="text-left py-3 px-4">Location</th>
              <th className="text-left py-3 px-4">Details</th>
              <th className="text-right py-3 px-4">Total Spend</th>
              <th className="text-center py-3 px-4">Status Points</th>
              <th className="text-center py-3 px-4">SP Status</th>
              <th className="text-right py-3 px-4">Points</th>
            </tr>
          </thead>
          <tbody>
            {purchaseHistory.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{item.date}</td>
                  <td className="py-4 px-4">{item.activity}</td>
                  <td className="py-4 px-4">{item.folioNumber || '-'}</td>
                  <td className="py-4 px-4">{item.location || '-'}</td>
                  <td className="py-4 px-4">{item.details || '-'}</td>
                  <td className="py-4 px-4 text-right">{item.totalSpend ? `$${item.totalSpend}` : '-'}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 rounded ${item.statusPoints ? 'bg-green-100 text-green-800' : ''}`}>
                      {item.statusPoints || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">{item.spStatus || '-'}</td>
                  <td className="py-4 px-4 text-right flex justify-end items-center">
                    <span className={item.points > 0 ? 'text-green-600' : 'text-red-600'}>
                      {item.points > 0 ? '+' : ''}{item.points || '-'}
                    </span>
                    {item.isExpandable && (
                      <button 
                        onClick={() => toggleRow(item.id)}
                        className="ml-2 p-1"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${expandedRows[item.id] ? 'transform rotate-180' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
                {expandedRows[item.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={9} className="py-4 px-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Casino</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Cash In</span>
                              <span>${item.cashIn || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cash Out</span>
                              <span>${item.cashOut || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Wager Amount</span>
                              <span>${item.wagerAmount || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Free Play Credit</span>
                              <span>${item.freePlayCredit || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Session Details</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Start Time</span>
                              <span>{item.sessionStartTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>End Time</span>
                              <span>{item.sessionEndTime}</span>
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
      </div>
    </div>
  );
};
