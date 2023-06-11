# J: this will also work for Polygon, Avalanche etc.
from web3 import Web3
from decimal import Decimal, getcontext
from erc20_ethereum import erc20_contracts
from exchange_wallets_ethereum import exchange_wallets
from web3 import Web3

# Set decimal precision
getcontext().prec = 50

# Connect to an Ethereum node
web3 = Web3(Web3.HTTPProvider(f'https://nd-731-159-663.p2pify.com/a4f22794c2dccf1bff52aff87a99725d'))

# Get the latest block number
latest_block_number = web3.eth.block_number

# Get the latest block
latest_block = web3.eth.get_block(latest_block_number)

eth_stats = {'eth_sent_volume': Decimal(0), 'eth_received_volume': Decimal(0), 'eth_num_received': Decimal(0)}
erc20_stats = {}
wallet_categories = {'< 100 ETH': Decimal(0), '100 - 500 ETH': Decimal(0), '500 - 1000 ETH': Decimal(0), '1000 - 5000 ETH': Decimal(0), '> 5000 ETH': Decimal(0)}
buckets = list(wallet_categories.keys())
for cat in buckets:
    wallet_categories[cat+"_num"] = Decimal(0)

for tx in latest_block.transactions:
    tx_details = web3.eth.get_transaction(tx.hex())

    # Extract transaction details
    value = Decimal(tx_details['value'])
    gas_fee = Decimal(tx_details['gasPrice'] * tx_details['gas'])
    erc20_sent = Decimal(0)

    input_data = tx_details['input']
    sender = tx_details['from']
    receiver = tx_details['to']
    print(f"{sender} sent {value} to {receiver}")

    # Check if the input data starts with the function signature of the ERC20 transfer function
    if input_data.startswith('0xa9059cbb'):
        print("The transaction is an ERC20 token transfer.")
        
        # Extract the ERC20 contract address
        contract_address = '0x' + input_data[34:74]

        # Extract the recipient address
        recipient_address = '0x' + input_data[74:114]

        # Extract the sent amount
        erc20_sent = int(input_data[114:], 16)

        print("ERC20 Contract Address:", receiver)
        print("Sender Address:", contract_address)
        print("Recipient Address:", recipient_address)
        print("Sent Amount:", erc20_sent)

    else:
        print("The transaction is not an ERC20 token transfer.")

    # Determine if sender or receiver is an exchange wallet
    sender_is_exchange = sender in exchange_wallets
    receiver_is_exchange = receiver in exchange_wallets

    # Update transaction volume statistics for Ethereum
    eth_stats['eth_sent_volume'] += value

    if receiver_is_exchange:
        eth_stats['eth_received_volume'] += value
        eth_stats['eth_num_received'] += 1

    # Update transaction volume statistics for ERC20 tokens
    if erc20_sent > 0:
        contract_address = receiver
        if contract_address not in erc20_stats:
            erc20_stats[contract_address] = {
                'sent_volume': Decimal(0), 
                'num_transactions': Decimal(0),
                'exchange_received_volume': Decimal(0),
                'exchange_received_num': Decimal(0),
                }
        erc20_stats[contract_address]['sent_volume'] += erc20_sent
        erc20_stats[contract_address]['num_transactions'] += 1

        if receiver_is_exchange:
            erc20_stats[contract_address]['exchange_received_volume'] += erc20_sent
            erc20_stats[contract_address]['exchange_received_num'] += 1

    # Categorize sender and receiver based on their ETH balance
    sender_balance = web3.eth.get_balance(sender)
    sender_balance_eth = web3.from_wei(sender_balance, 'ether')

    if not sender_is_exchange:
        if sender_balance_eth < Decimal(100):
            wallet_categories['< 100 ETH'] += value
            wallet_categories['< 100 ETH_num'] += 1
        elif sender_balance_eth < Decimal(500):
            wallet_categories['100 - 500 ETH'] += value
            wallet_categories['100 - 500 ETH_num'] += 1
        elif sender_balance_eth < Decimal(1000):
            wallet_categories['500 - 1000 ETH'] += value
            wallet_categories['500 - 1000 ETH_num'] += 1
        elif sender_balance_eth < Decimal(5000):
            wallet_categories['1000 - 5000 ETH'] += value
            wallet_categories['1000 - 5000 ETH_num'] += 1
        else:
            wallet_categories['> 5000 ETH'] += value
            wallet_categories['> 5000 ETH_num'] += 1

# Sort ERC20 tokens by amount sent
sorted_erc20_stats = sorted(erc20_stats.items(), key=lambda x: x[1]['sent_volume'], reverse=True)

# Print statistics
print("Ethereum Sent Volume:", eth_stats['eth_sent_volume'])
print("Exchange Ethereum Received Volume:", eth_stats['eth_received_volume'])
print("Exchange Num Received Ethereum:", eth_stats['eth_received_volume'])
print("Wallet Transaction Volume and Num:")
for category, volume in wallet_categories.items():
    print(category, ":", volume)

print("ERC20 Token Statistics:")
for contract_address, stats in erc20_stats.items():
    if contract_address in erc20_contracts:
        token_name = erc20_contracts[contract_address]
    else:
        token_name = "Unknown Token"
    print("Token Name:", token_name)
    print("Contract Address:", contract_address)
    print("Sent Volume:", stats['sent_volume'])
    print("# Transactions:", stats['num_transactions'])
    print("Exchange Received Volume:", stats['exchange_received_volume'])
    print("Exchange Received Num:", stats['exchange_received_volume'])
    print("*"*10)
