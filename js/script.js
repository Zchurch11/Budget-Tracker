const resetBtn = document.getElementById('reset')
const incomeText = document.getElementById('income')
const incomeInput = document.getElementById('incomeInput')
const incomeForm = document.getElementById('incomeForm')

const expenseForm = document.getElementById('expenseForm')
const expenseInput = document.getElementById('expenseName')
const expenseAmount = document.getElementById('expenseAmount')
const expenseEl = document.getElementById('expenseTotal')
const expenseSelect = document.getElementById('expenseSelect')
const expenseList = document.getElementById('expenseList')

const savingsForm = document.getElementById('savingsForm')
const savingsInput = document.getElementById('savingsName')
const savingsAmount = document.getElementById('savingsAmount') 
const savingsSelect = document.getElementById('savingsSelect')
const savingsList = document.getElementById('savingsList')
const monthlyContribution = document.getElementById('monthlyContribution')

// Reset
function resetIncome(){
localStorage.clear()
renderIncome()
displayIncome()
renderExpenses()
renderChart()
renderSavingsGoals()
console.log('clicked')
}
//Set income amount and display it in the income card 

function setIncomeToStorage(e) {

    e.preventDefault()
    let incomeValue =  incomeInput.value.trim()
    let monthlyIncome = getIncome()
    if (incomeValue === ''){
        alert("Please add your monthly income")
    } else {
       
       localStorage.setItem('income', JSON.stringify(incomeValue))
        incomeValue = 0
        const modalEl = document.getElementById('incomeModal')
        const modal = bootstrap.Modal.getInstance(modalEl)
        modal.hide()
        incomeInput.value = '' 
    }
    renderIncome()  
    displayIncome()
}

// Render income 
function renderIncome() {
  let monthlyIncome = getIncome()
  if(monthlyIncome){
    incomeText.textContent = `$${monthlyIncome.trim()}`
  } else{
    incomeText.textContent = '$0'
  }
  

}

// Get monthly Income from localstorage
function getIncome(){
  const monthlyIncome = JSON.parse(localStorage.getItem('income')) || 0
  return monthlyIncome
}

// Create a unique Id for each item
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// change word to uppercase if it isnt
function capitalizeFirstLetter(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Check form depending on type

function checkForm(type) {
  if (type === 'expense') {
      return expenseInput.value !== '' && expenseAmount.value !== '' && expenseSelect.value !== '';
  } else if (type === 'goal') {
      return savingsInput.value !== '' && savingsAmount.value !== '' && savingsSelect.value !== '' & monthlyContribution !== '';
  }
  return false; // In case the type is neither 'expense' nor 'goal'
}

// Set expense in localstorage
function setExpenseToStorage(){
    const expenses = getItemsFromStorage('expenses')
    const isValid = checkForm('expense')
    let newExpense = {
      id: generateUniqueId(),
      name: capitalizeFirstLetter(expenseInput.value),
      cost: parseInt(expenseAmount.value).toFixed(2),
      type: expenseSelect.value
    } 
    if (isValid){
      expenses.push(newExpense)
      localStorage.setItem('expenses', JSON.stringify(expenses))
      //Clear inputs
      expenseInput.value = ''
      expenseAmount.value = ''
      expenseSelect.value = ''
      renderExpenses()
      calculateExpenses()
      displayIncome()
      renderChart()
      const expenseCollapse = document.getElementById('collapseExpenses')
      const bsCollapse = new bootstrap.Collapse(expenseCollapse, {
        toggle: true
      });
      bsCollapse.show();
    
    } else {
      alert("Please fill in all fields in the expense form.")
    }
    
  }


//Get items from storage based on type
function getItemsFromStorage(type) {
  const items = JSON.parse(localStorage.getItem(type)) || [];
  return items;
}

// Render expenses
function renderExpenses() {
  const expenses = getItemsFromStorage('expenses');
  const totalExpenses = calculateExpenses()
  const largestExpense = findLargestExpense()
  expenseList.innerHTML = '';
  expenseEl.textContent = '$' + totalExpenses
  if (expenses.length !== 0){
  expenses.forEach(expense => {
        expenseList.innerHTML += `
              
          <li class="list-group-item d-flex justify-content-center align-items-center expenseItem bg-white border-secondary"><h4 class="mb-0">${expense.name}</h4><h4 class="mb-0 expenseName">$${expense.cost}</h4><button data-id="${expense.id}" class="deleteExpense btn btn-sm  px-2 py-1"><i class="deleteExpense fa-regular fa-trash-can text-danger fs-5"></i>
          </button> </li>
        `;});

  } else{
    const expenseCollapse = document.getElementById('collapseExpenses')
      const bsCollapse = new bootstrap.Collapse(expenseCollapse, {
        toggle: false
      });
      bsCollapse.show();
  }   
  const largestExpenseEl = document.getElementById('largestExpense')
  largestExpenseEl.textContent = `${largestExpense.name ? largestExpense.name : ''} - ${largestExpense.cost ? '$' + largestExpense.cost : ''}
  `
  const deleteButtons = document.querySelectorAll('.deleteExpense')
  deleteButtons.forEach(button => button.addEventListener('click', deleteItem))

}


function deleteItem(e) {
  const button = e.target.closest('button.deleteExpense');
  if (button) {
    const expenseId = button.getAttribute('data-id');
    removeItemFromStorage('expenses', expenseId); 
  } else {
    const goalButton = e.target.closest('button[data-id]');
    if (goalButton) {
      const goalId = goalButton.getAttribute('data-id');
      removeItemFromStorage('goals', goalId);
    }
  }
}

// Attach the event listener to the parent element or use event delegation
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('deleteExpense') || e.target.closest('.deleteExpense')) {
    deleteItem(e);
  }
});


// Filter expenses
function filterExpenses(e) {
  const text = e.target.value.toLowerCase().trim();
  console.log(`Filter text: ${text}`); // Debugging line

  document.querySelectorAll('.expenseItem').forEach(item => {
    const name = item.firstChild.textContent.toLowerCase();
    console.log(`Item name: ${name}`); // Debugging line
    
    if (name.includes(text)) {
      item.classList.add('d-block')
      item.classList.remove('d-none')
    } else {
      item.classList.add('d-none')
      item.classList.remove('d-block')
    }
  });
}


//Remove item from storage
function removeItemFromStorage(type,id) {
  if (type === 'expenses'){
    let expenses = getItemsFromStorage('expenses')
    expenses = expenses.filter(expense => expense.id !== id)
    localStorage.setItem('expenses', JSON.stringify(expenses))
    renderExpenses()
    displayIncome()
    renderChart()
  } else {
    let goals = getItemsFromStorage('goals')
    goals = goals.filter(goal => goal.id !== id)
    localStorage.setItem('goals', JSON.stringify(goals))
    renderSavingsGoals()
  }
}
// Delete goal from storage
function deleteGoal(e) {
  const button = e.target
  const goalId = button.getAttribute('data-id')
}

// calculate expense total

function calculateExpenses() {
  const items = getItemsFromStorage('expenses')
  let total = 0
  for (const item of items){
    total += +item.cost
  }
  return total.toFixed(2)
}

// Calculate income remaining
function calculateRemainingIncome() {
  const totalExpenses = calculateExpenses()
  const monthlyIncome = getIncome()
  const remaining = monthlyIncome - totalExpenses

  return remaining
  
}
// Find largest expense
function findLargestExpense() {
  const items = getItemsFromStorage('expenses')
  return items.reduce((max, item) => item.cost > max.cost ? item : max, {cost: 0})
}

function sumExpensesByType() {
  const items = getItemsFromStorage('expenses');
  const expenseSums = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = 0;
    }
    acc[item.type] += +item.cost;
    return acc;
  }, {});

  // Format the summed values to 2 decimal places
  for (let type in expenseSums) {
    expenseSums[type] = expenseSums[type].toFixed(2);
  }
  return expenseSums;
}



// display income remaining
function displayIncome() {
  const remaining = calculateRemainingIncome()
  const incomeRemainingEl = document.getElementById('moneySpent')
  if (remaining < 0){
    incomeRemainingEl.parentElement.classList.add('border-2','border-danger')
    incomeRemainingEl.innerHTML += `
    <h4 class="fs-2 text-danger fw-semibold mb-3">$${remaining.toFixed(2)}</h4>
  `
  } else {
    incomeRemainingEl.parentElement.classList.remove('border-2','border-danger')
    incomeRemainingEl.innerHTML = `<h5 class="mb-3 fs-3 ">Income Remaining</h5>
    <h4 class="fs-2 fw-semibold">$${remaining.toFixed(2)}</h4>
  `
  }
  
}

// Set savings goal in localstorage
function setSavingsGoal(){
  const savingsGoals = getItemsFromStorage('goals')
  const isValid = checkForm('goal')
  console.log(isValid)
  let newSavingsGoal = {
    id: generateUniqueId(),
    name: capitalizeFirstLetter(savingsInput.value),
    amount: savingsAmount.value,
    type: savingsSelect.value,
    contribution: monthlyContribution.value
    
  }
  if (isValid) {
    savingsGoals.push(newSavingsGoal)
    localStorage.setItem('goals', JSON.stringify([newSavingsGoal]));
    //Clear inputs
    savingsInput.value = ''
    savingsAmount.value = ''
    savingsSelect.value = ''
    monthlyContribution.value = ''
    
    
    const savingsCollapse = document.getElementById('collapseSavings')
    const bsCollapse = new bootstrap.Collapse(savingsCollapse, {
        toggle: true
      });
      bsCollapse.show();
    renderSavingsGoals()
  } else {
    alert("Please fill out all fields in the savings goal form.")
  }
  
}
//Display each goal stored in localstorage
function renderSavingsGoals() {
  const savingsGoals = getItemsFromStorage('goals');
  savingsList.innerHTML = '';
  savingsGoals.forEach(goal => {
      savingsList.innerHTML += `
            
        <li class="list-group-item d-flex justify-content-center align-items-center bg-white border-secondary"><h4 class="mb-0">${goal.name}</h4><h4 class="mb-0 goalName">$${goal.amount}</h4><button data-id="${goal.id}" class="deleteGoal btn btn-sm "><i class="deleteExpense fa-regular fa-trash-can text-danger fs-5"></i>
          </button> </li>
      `;
      
  });
  const deleteButtons = document.querySelectorAll('.deleteGoal')
  deleteButtons.forEach(button => button.addEventListener('click', deleteItem))
  renderGoalProgress()
}
// Calculate goal progress
// Adjust progress bar
function renderGoalProgress(){
  const progressContainer = document.querySelector('.goal-progress')
  const goal = getItemsFromStorage('goals')
  if (goal.length > 0){
    const { amount, contribution, ...otherDetails} = goal[0]
  
    const goalProgress = ( contribution / amount) * 100
    const progressBar = document.querySelector('.progress')
    const amountEl = document.getElementById('amountSaved')
    const goalTotalEl = document.getElementById('goalAmount')
    progressContainer.classList.remove('d-none')
    progressBar.innerHTML = `
    <div class="progress-bar bg-primary fs-5" role="progressbar" aria-valuenow=${goalProgress}" aria-valuemin="0" aria-valuemax="100" style="width: ${goalProgress}%">${goalProgress}%</div>
    `
    amountEl.textContent = `$${contribution} Saved`
    goalTotalEl.textContent = `Goal: $${amount}`
  } else {
    const savingsCollapse = document.getElementById('collapseSavings')
    const bsCollapse = new bootstrap.Collapse(savingsCollapse, {
        toggle: false
      });
      bsCollapse.show();
    progressContainer.classList.add('d-none')
  }
  
}

// Create spending chart
function renderChart () {
  const expenseAmounts = sumExpensesByType()
  const totalExpenses = calculateExpenses() 
  const expenses =  getItemsFromStorage('expenses')
  const expenseContainer = document.getElementById('expenseContainer')
  if (expenses.length > 0){
    expenseContainer.classList.add('show')
    Highcharts.chart('expenseContainer', {
    credits: {
      enabled: false
    },
    chart: {
        type: 'pie',
        backgroundColor: 'transparent',      
        custom: {},
        events: {
            render() {
                const chart = this,
                    series = chart.series[0];
                let customLabel = chart.options.chart.custom.label;

                if (!customLabel) {
                    customLabel = chart.options.chart.custom.label =
                        chart.renderer.label(
                            `Total Expenses<br/> 
                            <strong>$${totalExpenses}</strong>`
                        )
                            .css({
                                color: '#000',
                                fontSize: '1.2rem',
                                textAnchor: 'middle',
                                border: 'none',
                                
                            })
                            .add();
                }
                

                const x = series.center[0] + chart.plotLeft,
                    y = series.center[1] + chart.plotTop -
                    (customLabel.attr('height') / 2);

                customLabel.attr({
                    x,
                    y
                });
                // Set font size based on chart diameter
                customLabel.css({
                    fontSize: `${series.center[1] / 7}px`
                });
            }
        }
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    title: {
        text: 'Monthly Spending'
    },
    tooltip: {
      formatter: function() {
        return this.point.name + ': $' + this.y.toFixed(2);
    }
    },
    
    plotOptions: {
        series: {
            allowPointSelect: true,
            cursor: 'pointer',
            borderRadius: 8,
            dataLabels: [{
                enabled: true,
                distance: 20,
                format: '{point.name}',
                style: {
                  fontSize: '.9em'
                }
            }, {
                enabled: true,
                distance: -20,
                format: '{point.percentage:.0f}%',
                style: {
                    fontSize: '1em'
                }
            }],
            showInLegend: false
        }
    },
    series: [{
      name: 'Percentage of income',
      colorByPoint: true,
      innerSize: '70%',
      data: [{
          name: 'Bills',
          y: parseFloat(expenseAmounts.bill),
          color: '#1d4ed8'
      }, {
          name: 'Food',
          y: parseFloat(expenseAmounts.food),
          color: '#dbeafe'
      }, {
          name: 'Transportation',
          y: parseFloat(expenseAmounts.transportation),
          color: '#1e3a8a'
      }, {
          name: 'Other',
          y: parseFloat(expenseAmounts.other),
          color: '#bfdbfe'
      }, {
          name: 'Entertainment',
          y: parseFloat(expenseAmounts.entertainment),
          color: '#0e245e'
      }],
      
  }],
  responsive: {
    rules: [{
        condition: {
            maxWidth: 500
        },
        chartOptions: {
            
            plotOptions: {
                series: {
                    dataLabels: [{
                        enabled: false,
                        
                    }],
                    showInLegend: true
                    }
            }
        }
    }]
    
    
}

})
  } else {
    expenseContainer.classList.remove('show')

  }
  
  

  }
  







incomeForm.addEventListener('submit', setIncomeToStorage)
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault()
  
    setExpenseToStorage()
  
})
savingsForm.addEventListener('submit', (e) => {
  e.preventDefault()

  
    setSavingsGoal()
  
})
document.addEventListener('DOMContentLoaded', () => {
  renderExpenses()
  renderSavingsGoals()
  renderIncome()
  calculateExpenses()
  displayIncome()
  renderChart()
} 
)
document.getElementById('filterExpenses').addEventListener('input', filterExpenses)
resetBtn.addEventListener('click', resetIncome)
// Chart library

