import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, MenuItem, Select } from '@mui/material';

interface BuyPointsProps {
  open: boolean;
  onClose: (value: number | false) => void;
}

interface PointOption {
  value: number;
  displayName: string;
}

export const BuyPoints: React.FC<BuyPointsProps> = ({ open, onClose }) => {
  const [points, setPoints] = React.useState<number | ''>('');

  const pointsList: PointOption[] = [
    { value: 5000, displayName: '5,000 Points' },
    { value: 10000, displayName: '10,000 Points' },
    { value: 15000, displayName: '15,000 Points' },
    { value: 20000, displayName: '20,000 Points' }
  ];

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <div className="w-500 h-250">
        <DialogTitle className="flex justify-between items-center px-5 py-2.5">
          <h3 className="m-0">Buy Points</h3>
          <Button onClick={() => onClose(false)}>
            <span className="material-icons">close</span>
          </Button>
        </DialogTitle>
        
        <DialogContent className="px-5">
          <FormControl fullWidth variant="outlined" className="mt-5">
            <Select
              value={points}
              onChange={(e) => setPoints(e.target.value as number)}
              displayEmpty
              label="Select Required Points"
            >
              {pointsList.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions className="justify-end px-5">
          <Button onClick={() => onClose(false)} className="mr-5">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!points}
            onClick={() => onClose(points as number)}
            className="h-12 w-24"
          >
            Buy
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};