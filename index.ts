import * as React from 'react';
import { View, Text, StyleSheet, TextInput, SectionList, TouchableOpacity } from 'react-native';

interface CellProps {
}

interface CellState {
  valueColumn: number;
  valueRow: number;
  matrix: number[][];
  result: number;
}

interface CellDetails {
  sectionIndex: number,
  value: number,
}

interface CellObject {
  item: CellDetails,
  index: number,
}

interface numericInputProps {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
}

const NumericInputWithTitle = (inputProps: numericInputProps) => {
  return (
    <View style={{ flexDirection: 'row', margin: 8 }}>
      <Text style={{ width: '50%' }}>{inputProps.title} :</Text>
      <TextInput
        maxLength={2}
        onChangeText={inputProps.onChangeText}
        multiline={false}
        style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 18, color: '#404040', width: 30, borderColor: 'grey', borderWidth: 1, }}
        value={inputProps.value}
        placeholder={'Number of Row'}
        keyboardType={'numeric'}
      />
    </View>
  );
};

export default class App extends React.Component<CellProps, CellState> {

  constructor(props: CellProps) {
    super(props);
    this.state = {
      valueColumn: 0,
      valueRow: 0,
      result: 0,
      matrix: [],
    };
  }

  public processMatrixForSectionList = () => {
    const processedMatrix: { title: string, data: CellDetails[] }[] = [];
    let sectionIndex = 0;
    this.state.matrix.forEach((matrixRow) => {
      const arrTemp: CellDetails[] = [];
      matrixRow.forEach((value: number) => {
        const newCellDetails: CellDetails = { value, sectionIndex }
        arrTemp.push(newCellDetails);
      });
      const newRow = {
        title: 'Title',
        data: arrTemp,
      }
      processedMatrix.push(newRow);
      sectionIndex++;
    }
    );
    return processedMatrix;
  }

  public createNewArray() {
      const matrix = new Array(this.state.valueRow);
      for (var i = 0; i < this.state.valueRow; i++) {
        matrix[i] = new Array(this.state.valueColumn);
        for (var j = 0; j < this.state.valueColumn; j++) {
          matrix[i][j] = 0;
        }
      }
      return matrix
  }

  public render() {
    const valueOfRow = this.state.valueRow;
    const valueOfColumn = this.state.valueColumn;
    return (
      <View style={{ height: '100%', padding: 24, backgroundColor: 'white' }}>
        <Text style={styles.centerLabel}>The biggest region count is</Text>
        <Text style={[styles.centerLabel, { fontWeight: '300', fontSize: 40 }]}>{this.state.result}</Text>
        <NumericInputWithTitle
          title={'No. of Column'}
          value={valueOfColumn.toString()}
          onChangeText={(value: string) => {
            this.setState({ valueColumn: Number(value) }, () => {
              if (this.state.valueRow > 0 && this.state.valueColumn > 0){
                const matrix = this.createNewArray();
                if (matrix !== this.state.matrix){
                    this.setState({ matrix });
                }
              }
            });
          }}
        />
        <NumericInputWithTitle
          title={'No. of Row'}
          value={valueOfRow.toString()}
          onChangeText={(value: string) => {
            this.setState({ valueRow: Number(value) }, () => {
                if (this.state.valueRow > 0 && this.state.valueColumn > 0){
                  const matrix = this.createNewArray();
                  if (matrix !== this.state.matrix){
                      this.setState({ matrix });
                  }
                }
            });
          }}
        />
        <SectionList
          contentContainerStyle={styles.sectionContainer}
          horizontal={true}
          sections={this.processMatrixForSectionList()}
          renderItem={this._renderColumn}
          removeClippedSubviews={false}

        />
      </View>);
  }

  private _renderColumn = (props: { item: CellDetails, index: number }) => {
    return (
      <TouchableOpacity onPress={() => this._onPress(props)} style={[styles.cellContainer, { width: `${90 / this.state.valueRow}%` }]}>
          <Text style={styles.cellNumber}>{props.item.value.toString()}</Text>
      </TouchableOpacity>

    );
  }

  private _onPress(cellObject: CellObject) {
    const row = cellObject.item.sectionIndex;
    const column = cellObject.index;
    const matrix = this.state.matrix;
    matrix[row][column] = matrix[row][column] == 1 ? 0 : 1;
    this.setState({ matrix, result: this._calculateBiggestRegion(matrix) })
  }

  // check if given cell can be included in DFS
  private _isValidDFS(cellMatrix: number[][], row: number, column: number, CheckedCellArray: boolean[][]) {
    return ((row >= 0) && (row < this.state.valueRow) &&
      (column >= 0) && (column < this.state.valueColumn) &&
      (cellMatrix[row][column] == 1) && !CheckedCellArray[row][column])
  };

  // Perform Depth First Search on the cell
  private _depthFirstSearch(cellMatrix: number[][], row: number, column: number, CheckedCellArray: boolean[][], count: number) {
    const rowNeighbor = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colNeighbor = [-1, 0, 1, -1, 1, -1, 0, 1];
    CheckedCellArray[row][column] = true;

    for (let x = 0; x < 8; x++) {
      if (this._isValidDFS(cellMatrix, row + rowNeighbor[x], column + colNeighbor[x], CheckedCellArray)) {
        count = this._depthFirstSearch(cellMatrix, row + rowNeighbor[x], column + colNeighbor[x], CheckedCellArray, count + 1);
      }
    }
    return count;
  }

  private _calculateBiggestRegion(cellMatrix: number[][]) {
    let CheckedCellArray = new Array(this.state.valueRow);
    for (var i = 0; i < this.state.valueRow; i++) {
      CheckedCellArray[i] = new Array(this.state.valueColumn);
      for (var j = 0; j < this.state.valueColumn; j++) {
        CheckedCellArray[i][j] = false;
      }
    }
    let result = Number.MIN_VALUE;
    for (let i = 0; i < this.state.valueRow; i++) {
      for (let j = 0; j < this.state.valueColumn; j++) {
        if (cellMatrix[i][j] == 1 && !CheckedCellArray[i][j]) {
          let count = this._depthFirstSearch(cellMatrix, i, j, CheckedCellArray, 1);
          result = Math.max(result, count);
        }
      }
    }
    return result || 0;
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    borderLeftWidth: 4,
    borderRightWidth: 4,
    height: 70
  },
  labels: {
    width: 150,
    height: 36,
    backgroundColor: 'powderblue',
    padding: 8
  },
  inputField: {
    width: 100,
    height: 36,
    backgroundColor: 'skyblue',
    padding: 8
  },
  sectionContainer: {
    width: '100%',
    maxHeight: '70%',
    flexWrap: 'wrap',
    margin: 1,
  },
  centerLabel: {
    textAlign: 'center',
  },
  cellContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    height: 30,
    margin: 1,
    flexGrow: 1,
    alignItems: 'center',
  },
  cellNumber: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 2,
    width: 30,
  },
})

