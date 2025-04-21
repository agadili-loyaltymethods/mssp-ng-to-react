
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
  Box
} from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp, Refresh } from '@material-ui/icons';
import { useMemberService } from '../../hooks/useMemberService';
import { useAlertService } from '../../hooks/useAlertService';
import { NoData } from '../common/NoData';
import { formatCurrency } from '../../utils/formatters';

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

export const PurchaseHistory: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const memberInfo = useSelector((state: any) => state.member);
  const memberService = useMemberService();
  const alertService = useAlertService();

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
        .map(formatHistory);
      
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

  const filteredHistory = purchaseHistory.filter((item) => 
    Object.values(item).some((value) => 
      String(value).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col w-[1300px] mt-5 gap-5">
        <Card className="border-gray w-full">
          <CardContent className="pt-5">
            <div className="flex justify-between items-end gap-7 pl-4 pr-4">
              <div className="flex items-center">
                <h3 className="mt-3 mr-2.5 text-lg">Activity History</h3>
                <IconButton className="refresh-btn" onClick={getActivityHistory}>
                  <Refresh />
                </IconButton>
              </div>
              <TextField
                placeholder="Search"
                onChange={(e) => setFilterText(e.target.value)}
                InputProps={{
                  endAdornment: <Search color="action" />
                }}
              />
            </div>

            <TableContainer className="ph-table overflow-y-auto">
              {/* Table implementation */}
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
