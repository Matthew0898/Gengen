function generateKenken (size) {
    var kenken = new Kenken(size)
    renderKenken(kenken)
}


// A class for the ken ken board
function Kenken (size) {
    this.size = size
    this.board = []
	this.minGroupSize = 1
	this.maxGroupSize = 5 //TO DO: This should be determined from web page
	this.cellGroups = []
	
	
	var builderArray = shuffledArray(size)
    
    for (var x = 0; x < size; x++) {
        this.board[x] = []
        for (var y = 0; y < size; y++) {
			// Fills the board with cells, where each row of cells have the values
			// of the builderArray, cyclically shifted to the left by x (the row number)
            this.board[x][y] = new Cell(this, x, y, builderArray[(x+y)%size])
        }
    }
	shuffleBoard(size,this.board)
	
	var groupID = 1
	for(var x = 0; x < size; x++) {
		for(var y = 0; y < size; y++) {
			console.log('Checking cell with board loction- X: '+x+', Y: '+y)
			console.log('Actual cell location- X: '+this.board[x][y].x+', Y: '+this.board[x][y].y)
			if(this.board[x][y].cellGroup == undefined) {
				console.log('Cell was undefined!')
				// Generate a random integer in the range [minGroupSize,maxGroupSize] for the size of the group
				var groupSize = Math.floor((this.maxGroupSize-this.minGroupSize+1)*Math.random()+(this.minGroupSize))
				// Create the new CellGroup object
				var newCellGroup = new CellGroup(this, this.board[x][y], groupID)
				// Grow the new cell group groupSize-1 times, only if the groupSize is not one (since it already has size one)
				if(groupSize != 1) {
					for(var m = 0; m < groupSize-1; m++) {
						newCellGroup.grow()
					}
				}
				this.cellGroups.push(newCellGroup)
				
				// The code in the following block is purely to make sure cells are working right
				console.log('Created group of cells with ID: '+groupID+' of wanted size '+groupSize+' but was actually of size '+newCellGroup.cells.length)
				console.log('Group locations:')
				for(var k = 0; k < newCellGroup.cells.length; k++) {
					console.log('Cell with location- X: '+newCellGroup.cells[k].x+', Y: '+newCellGroup.cells[k].y)
				}
				
				groupID = groupID + 1
			}
		}
	}
}

function shuffleBoard (size,board) {
	// Swap two columns and then two rows. Do this 'size' times to get a decent mix up of the board.
	for (var i = 0; i < size; i++) {
		// Generate two random integers in the range [0,size)
		var column1 = Math.floor(size*Math.random())
		var column2 = Math.floor(size*Math.random())
		console.log('swapping columns: '+column1+' and '+column2)
		// Swap the two columns
		// This means we also need to switch the y values of the cells!
		for(var j = 0; j < size; j++) {
			var tempCell = board[j][column1]
			var tempCellY = tempCell.y
			board[j][column1] = board[j][column2]
			board[j][column1].y = board[j][column2].y
			board[j][column2] = tempCell
			board[j][column2].y = tempCellY
		}
		
		// Generate two random integers in the range [0,size)
		var row1 = Math.floor(size*Math.random())
		var row2 = Math.floor(size*Math.random())
		console.log('swapping rows: '+row1+' and '+row2)
		// Swap the two rows
		// This means we also need to switch the x values of the cells!
		for(var j = 0; j < size; j++) {
			var tempCell = board[row1][j]
			var tempCellX = tempCell.x
			board[row1][j] = board[row2][j]
			board[row1][j].x = board[row2][j].x
			board[row2][j] = tempCell
			board[row2][j].x = tempCellX
		}
	}
}

// A class for a single grouping of cells on the ken ken board
function CellGroup (kenken, cell, id) {
	// The ken ken board this group belongs to (is this necessary?)
	this.kenken = kenken
	// The id of this group of cells
	this.groupID = id
	// The array that will hold the cells in this group, starting with the initial cell
	this.cells = [cell]
	// Set the cellGroup of the initial cell to this CellGroup Object
	cell.setCellGroup(this)
	// The current size of the cell group
	this.currentSize = 1
}

// Grow the cell group up to maximum size, or smaller if board is not big enough
// Returns true if growing was successful, false if it was unsuccessful
CellGroup.prototype.grow = function() {
	// Generate a random integer in range [0,cells.length-1] for which cell we should attempt to grow at first
	var startingCellNumber = Math.floor(this.cells.length*Math.random())
	var cellNum = startingCellNumber
	while(true) {
		var cellToGrowFrom = this.cells[cellNum]
		// Get the array of neighbors of this cell
		var cellNeighbors = cellToGrowFrom.getNeighbors()
		//Generate a random integer in range [0,cellNeighbors.length-1]
		var neighborCellNum = Math.floor(cellNeighbors.length*Math.random())
		// Go through each neighbor. If one is valid, make it the next cell in this group.
		for(var i = 0; i < cellNeighbors.length; i++) {
			var neighborCell = cellNeighbors[((i+neighborCellNum)%cellNeighbors.length)]
			if(neighborCell.cellGroup == undefined) {
				this.cells.push(neighborCell)
				neighborCell.setCellGroup(this)
				return true
			}
		}
		
		// If all the neighbors were invalid, try the next cell in the list
		cellNum = (cellNum + 1) % this.cells.length
		if(cellNum == startingCellNumber) {
			// we have gone through the whole list with no valid neighbors
			return false
		}
		
	}
}

// A class for a single cell in the Kenken which houses data on the cell and methods for finding adjacent cells
function Cell (kenken, x, y, value) {
    this.kenken = kenken
    this.x = x
    this.y = y
	this.cellGroup = undefined
	this.value = value
}

// Function for setting the cell group that a cell belongs to
Cell.prototype.setCellGroup = function(cellGroup) {
	this.cellGroup = cellGroup
}

// Return an array of the cells neighbors
Cell.prototype.getNeighbors = function () {
    var neighbors = []
    
    if (this.x > 0) neighbors.push(this.kenken.board[this.x-1][this.y])
    if (this.y > 0) neighbors.push(this.kenken.board[this.x][this.y-1])
    if (this.x < this.kenken.size - 1) neighbors.push(this.kenken.board[this.x+1][this.y])
    if (this.y < this.kenken.size - 1) neighbors.push(this.kenken.board[this.x][this.y+1])
    
    return neighbors
}

// Return an object with the cell's neighbors indexed by relative location
Cell.prototype.getNeighborsOriented = function () {
    var neighbors = {}
    
    if (this.x > 0) neighbors.left = this.kenken.board[this.x-1][this.y]
    if (this.y > 0) neighbors.up = this.kenken.board[this.x][this.y-1]
    if (this.x < this.kenken.size - 1) neighbors.right = this.kenken.board[this.x+1][this.y]
    if (this.y < this.kenken.size - 1) neighbors.down = this.kenken.board[this.x][this.y+1]
    
    return neighbors
}

// Function to generate an array with the numbers 1 through n in a random order
function shuffledArray (n) {
	var numberArray=[]
	// Fill the array with numbers 1 through n
	for(var i = 0; i < n; i++) {
		numberArray.push(i+1)
	}
	
	// Randomly shuffle the array, doing the algorithm once forward and once
	// backward, to help create more "randomness" and to attemp to resolve the 
	// first element problem. (First element would never end up in first spot)
	for (var i = 0; i < n-1; i++) {
		// Generate a random integer in the range [i,n-1]
		// Since Math.random() generates a number in the range [0,1)
		var randomNum = Math.floor((n-i)*Math.random()+i)
		
		//swap the array at spots i and randomNum
		var numToSwap = numberArray[i]
		numberArray[i] = numberArray[randomNum]
		numberArray[randomNum] = numToSwap
    }
	
	//return then shuffled array
	return numberArray
}