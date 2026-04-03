"""
Authorize.net Live Payment Gateway Integration
Production API integration for payment processing, refunds, voids, and transaction queries.
"""

import os
from authorizenet import apicontractsv1
from authorizenet.apicontrollers import (
    createTransactionController,
    getTransactionDetailsController,
    getSettledBatchListController,
    getTransactionListController
)
from authorizenet.constants import constants
from datetime import datetime, timezone, timedelta
from typing import Optional
from uuid import uuid4

API_LOGIN_ID = os.environ.get("AUTHORIZENET_API_LOGIN_ID")
TRANSACTION_KEY = os.environ.get("AUTHORIZENET_TRANSACTION_KEY")
ENV = os.environ.get("AUTHORIZENET_ENV", "production")

def get_merchant_auth():
    """Create merchant authentication object"""
    merchantAuth = apicontractsv1.merchantAuthenticationType()
    merchantAuth.name = API_LOGIN_ID
    merchantAuth.transactionKey = TRANSACTION_KEY
    return merchantAuth

def get_environment():
    """Return the appropriate API endpoint based on environment"""
    if ENV == "sandbox":
        return constants.SANDBOX
    return constants.PRODUCTION


def charge_credit_card(amount, card_number, expiration_date, card_code, 
                       order_description=None, invoice_number=None,
                       customer_email=None, customer_id=None,
                       bill_to=None):
    """
    Authorize and capture a credit card payment.
    Returns dict with transaction result.
    """
    merchantAuth = get_merchant_auth()
    
    # Credit card info
    creditCard = apicontractsv1.creditCardType()
    creditCard.cardNumber = card_number
    creditCard.expirationDate = expiration_date
    creditCard.cardCode = card_code
    
    payment = apicontractsv1.paymentType()
    payment.creditCard = creditCard
    
    # Transaction request
    txnRequest = apicontractsv1.transactionRequestType()
    txnRequest.transactionType = "authCaptureTransaction"
    txnRequest.amount = str(amount)
    txnRequest.payment = payment
    
    # Order info
    if order_description or invoice_number:
        order = apicontractsv1.orderType()
        if invoice_number:
            order.invoiceNumber = str(invoice_number)[:20]
        if order_description:
            order.description = str(order_description)[:255]
        txnRequest.order = order
    
    # Customer info
    if customer_email or customer_id:
        customer = apicontractsv1.customerDataType()
        if customer_email:
            customer.email = customer_email
        if customer_id:
            customer.id = str(customer_id)[:20]
        txnRequest.customer = customer
    
    # Billing address
    if bill_to:
        billTo = apicontractsv1.customerAddressType()
        billTo.firstName = bill_to.get("first_name", "")[:50]
        billTo.lastName = bill_to.get("last_name", "")[:50]
        if bill_to.get("company"):
            billTo.company = bill_to["company"][:50]
        if bill_to.get("address"):
            billTo.address = bill_to["address"][:60]
        if bill_to.get("city"):
            billTo.city = bill_to["city"][:40]
        if bill_to.get("state"):
            billTo.state = bill_to["state"][:40]
        if bill_to.get("zip"):
            billTo.zip = bill_to["zip"][:20]
        if bill_to.get("country"):
            billTo.country = bill_to["country"][:60]
        txnRequest.billTo = billTo
    
    # Create the request
    createtxnrequest = apicontractsv1.createTransactionRequest()
    createtxnrequest.merchantAuthentication = merchantAuth
    createtxnrequest.refId = str(uuid4())[:20]
    createtxnrequest.transactionRequest = txnRequest
    
    # Execute
    controller = createTransactionController(createtxnrequest)
    controller.setenvironment(get_environment())
    controller.execute()
    
    response = controller.getresponse()
    
    return _parse_transaction_response(response, "authCaptureTransaction", amount)


def authorize_only(amount, card_number, expiration_date, card_code,
                   order_description=None, invoice_number=None,
                   customer_email=None):
    """
    Authorize a credit card without capturing (hold funds).
    Must follow up with capture_authorized to collect.
    """
    merchantAuth = get_merchant_auth()
    
    creditCard = apicontractsv1.creditCardType()
    creditCard.cardNumber = card_number
    creditCard.expirationDate = expiration_date
    creditCard.cardCode = card_code
    
    payment = apicontractsv1.paymentType()
    payment.creditCard = creditCard
    
    txnRequest = apicontractsv1.transactionRequestType()
    txnRequest.transactionType = "authOnlyTransaction"
    txnRequest.amount = str(amount)
    txnRequest.payment = payment
    
    if order_description:
        order = apicontractsv1.orderType()
        order.description = str(order_description)[:255]
        txnRequest.order = order
    
    createtxnrequest = apicontractsv1.createTransactionRequest()
    createtxnrequest.merchantAuthentication = merchantAuth
    createtxnrequest.refId = str(uuid4())[:20]
    createtxnrequest.transactionRequest = txnRequest
    
    controller = createTransactionController(createtxnrequest)
    controller.setenvironment(get_environment())
    controller.execute()
    
    response = controller.getresponse()
    return _parse_transaction_response(response, "authOnlyTransaction", amount)


def capture_authorized(transaction_id, amount=None):
    """
    Capture a previously authorized transaction.
    If amount is None, captures the full authorized amount.
    """
    merchantAuth = get_merchant_auth()
    
    txnRequest = apicontractsv1.transactionRequestType()
    txnRequest.transactionType = "priorAuthCaptureTransaction"
    txnRequest.refTransId = str(transaction_id)
    if amount is not None:
        txnRequest.amount = str(amount)
    
    createtxnrequest = apicontractsv1.createTransactionRequest()
    createtxnrequest.merchantAuthentication = merchantAuth
    createtxnrequest.refId = str(uuid4())[:20]
    createtxnrequest.transactionRequest = txnRequest
    
    controller = createTransactionController(createtxnrequest)
    controller.setenvironment(get_environment())
    controller.execute()
    
    response = controller.getresponse()
    return _parse_transaction_response(response, "priorAuthCaptureTransaction", amount)


def refund_transaction(transaction_id, amount, card_number_last_four, expiration_date):
    """
    Refund a settled transaction.
    Requires the last 4 digits of the card and expiration date.
    """
    merchantAuth = get_merchant_auth()
    
    creditCard = apicontractsv1.creditCardType()
    creditCard.cardNumber = card_number_last_four
    creditCard.expirationDate = expiration_date
    
    payment = apicontractsv1.paymentType()
    payment.creditCard = creditCard
    
    txnRequest = apicontractsv1.transactionRequestType()
    txnRequest.transactionType = "refundTransaction"
    txnRequest.amount = str(amount)
    txnRequest.payment = payment
    txnRequest.refTransId = str(transaction_id)
    
    createtxnrequest = apicontractsv1.createTransactionRequest()
    createtxnrequest.merchantAuthentication = merchantAuth
    createtxnrequest.refId = str(uuid4())[:20]
    createtxnrequest.transactionRequest = txnRequest
    
    controller = createTransactionController(createtxnrequest)
    controller.setenvironment(get_environment())
    controller.execute()
    
    response = controller.getresponse()
    return _parse_transaction_response(response, "refundTransaction", amount)


def void_transaction(transaction_id):
    """
    Void an unsettled transaction (cancel before settlement).
    """
    merchantAuth = get_merchant_auth()
    
    txnRequest = apicontractsv1.transactionRequestType()
    txnRequest.transactionType = "voidTransaction"
    txnRequest.refTransId = str(transaction_id)
    
    createtxnrequest = apicontractsv1.createTransactionRequest()
    createtxnrequest.merchantAuthentication = merchantAuth
    createtxnrequest.refId = str(uuid4())[:20]
    createtxnrequest.transactionRequest = txnRequest
    
    controller = createTransactionController(createtxnrequest)
    controller.setenvironment(get_environment())
    controller.execute()
    
    response = controller.getresponse()
    return _parse_transaction_response(response, "voidTransaction", 0)


def get_transaction_details(transaction_id):
    """
    Get full details of a specific transaction from Authorize.net.
    """
    merchantAuth = get_merchant_auth()
    
    txnDetailsRequest = apicontractsv1.getTransactionDetailsRequest()
    txnDetailsRequest.merchantAuthentication = merchantAuth
    txnDetailsRequest.transId = str(transaction_id)
    
    controller = getTransactionDetailsController(txnDetailsRequest)
    controller.setenvironment(get_environment())
    controller.execute()
    
    response = controller.getresponse()
    
    if response is not None and hasattr(response, 'messages'):
        if response.messages.resultCode == "Ok":
            txn = response.transaction
            return {
                "success": True,
                "transaction_id": str(txn.transId),
                "status": str(txn.transactionStatus) if hasattr(txn, 'transactionStatus') else None,
                "amount": float(str(txn.authAmount)) if hasattr(txn, 'authAmount') else None,
                "settle_amount": float(str(txn.settleAmount)) if hasattr(txn, 'settleAmount') else None,
                "submit_time": str(txn.submitTimeUTC) if hasattr(txn, 'submitTimeUTC') else None,
                "payment_type": str(txn.payment.creditCard.cardType) if hasattr(txn, 'payment') and hasattr(txn.payment, 'creditCard') else None,
                "card_number": str(txn.payment.creditCard.cardNumber) if hasattr(txn, 'payment') and hasattr(txn.payment, 'creditCard') else None,
            }
        else:
            return {
                "success": False,
                "error_code": str(response.messages.message[0].code),
                "error_message": str(response.messages.message[0].text)
            }
    return {"success": False, "error_message": "No response from gateway"}


def get_settled_batch_list(start_date=None, end_date=None):
    """Get list of settled batches within a date range using direct API."""
    import requests
    import json

    if not start_date:
        start_date = datetime.now(timezone.utc) - timedelta(days=30)
    if not end_date:
        end_date = datetime.now(timezone.utc)

    payload = {
        "getSettledBatchListRequest": {
            "merchantAuthentication": {
                "name": API_LOGIN_ID,
                "transactionKey": TRANSACTION_KEY
            },
            "includeStatistics": "true",
            "firstSettlementDate": start_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "lastSettlementDate": end_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    }

    url = "https://api.authorize.net/xml/v1/request.api" if ENV == "production" else "https://apitest.authorize.net/xml/v1/request.api"

    try:
        resp = requests.post(url, json=payload, timeout=30)
        text = resp.text.lstrip('\ufeff')
        data = json.loads(text)
    except Exception as e:
        return {"success": False, "error_message": str(e)}

    messages = data.get("messages", {})
    if messages.get("resultCode") != "Ok":
        msg = messages.get("message", [{}])
        return {"success": False, "error_message": msg[0].get("text", "Unknown") if msg else "Unknown"}

    batches = []
    batch_list = data.get("batchList", [])
    if isinstance(batch_list, dict):
        batch_list = [batch_list]
    for batch in batch_list:
        batch_info = {
            "batch_id": str(batch.get("batchId", "")),
            "settlement_state": batch.get("settlementState"),
            "settlement_time": batch.get("settlementTimeUTC"),
        }
        stats = batch.get("statistics", [])
        if isinstance(stats, dict):
            stats = [stats]
        for stat in stats:
            acct_type = stat.get("accountType", "Unknown")
            batch_info[f"stat_{acct_type}"] = {
                "total": float(stat.get("chargeAmount", 0)),
                "count": int(stat.get("chargeCount", 0)),
                "refund_total": float(stat.get("refundAmount", 0)),
                "refund_count": int(stat.get("refundCount", 0)),
            }
        batches.append(batch_info)

    return {"success": True, "batches": batches}


def get_transaction_list(batch_id):
    """Get list of transactions in a specific batch using direct API call."""
    import requests
    import json

    payload = {
        "getTransactionListRequest": {
            "merchantAuthentication": {
                "name": API_LOGIN_ID,
                "transactionKey": TRANSACTION_KEY
            },
            "batchId": batch_id,
            "sorting": {
                "orderBy": "submitTimeUTC",
                "orderDescending": True
            },
            "paging": {
                "limit": "1000",
                "offset": "1"
            }
        }
    }

    url = "https://api.authorize.net/xml/v1/request.api" if ENV == "production" else "https://apitest.authorize.net/xml/v1/request.api"

    try:
        resp = requests.post(url, json=payload, timeout=30)
        # Strip BOM if present
        text = resp.text.lstrip('\ufeff')
        data = json.loads(text)
    except Exception as e:
        return {"success": False, "error_message": str(e)}

    messages = data.get("messages", {})
    if messages.get("resultCode") != "Ok":
        msg = messages.get("message", [{}])
        return {"success": False, "error_message": msg[0].get("text", "Unknown error") if msg else "Unknown error"}

    transactions = []
    txn_list = data.get("transactions", [])
    if isinstance(txn_list, dict):
        txn_list = [txn_list]
    for txn in txn_list:
        t = {
            "transaction_id": str(txn.get("transId", "")),
            "submit_time": txn.get("submitTimeUTC"),
            "settle_amount": float(txn.get("settleAmount", 0)),
            "transaction_status": txn.get("transactionStatus"),
            "account_type": txn.get("accountType"),
            "account_number": txn.get("accountNumber"),
            "first_name": txn.get("firstName"),
            "last_name": txn.get("lastName"),
            "invoice_number": txn.get("invoiceNumber"),
            "has_returned_items": txn.get("hasReturnedItems") == "true"
        }
        transactions.append(t)

    return {"success": True, "transactions": transactions, "total": len(transactions)}


def get_unsettled_transaction_list():
    """Get list of unsettled (pending) transactions."""
    from authorizenet.apicontrollers import getUnsettledTransactionListController
    merchantAuth = get_merchant_auth()
    
    request = apicontractsv1.getUnsettledTransactionListRequest()
    request.merchantAuthentication = merchantAuth
    request.paging = apicontractsv1.Paging()
    request.paging.limit = 1000
    request.paging.offset = 1
    
    controller = getUnsettledTransactionListController(request)
    controller.setenvironment(get_environment())
    controller.execute()
    
    response = controller.getresponse()
    
    if response is not None and hasattr(response, 'messages'):
        if response.messages.resultCode == "Ok":
            transactions = []
            if hasattr(response, 'transactions') and response.transactions:
                for txn in response.transactions.transaction:
                    t = {
                        "transaction_id": str(txn.transId),
                        "submit_time": str(txn.submitTimeUTC) if hasattr(txn, 'submitTimeUTC') else None,
                        "settle_amount": float(str(txn.settleAmount)) if hasattr(txn, 'settleAmount') else 0,
                        "transaction_status": str(txn.transactionStatus) if hasattr(txn, 'transactionStatus') else None,
                        "account_type": str(txn.accountType) if hasattr(txn, 'accountType') else None,
                    }
                    if hasattr(txn, 'firstName'):
                        t["first_name"] = str(txn.firstName)
                    if hasattr(txn, 'lastName'):
                        t["last_name"] = str(txn.lastName)
                    transactions.append(t)
            return {"success": True, "transactions": transactions, "total": len(transactions)}
        else:
            return {
                "success": False,
                "error_code": str(response.messages.message[0].code),
                "error_message": str(response.messages.message[0].text)
            }
    return {"success": False, "error_message": "No response from gateway"}


def _parse_transaction_response(response, txn_type, amount):
    """Parse the Authorize.net transaction response into a standard dict"""
    result = {
        "success": False,
        "transaction_type": txn_type,
        "amount": float(amount) if amount else 0,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    if response is not None:
        if response.messages.resultCode == "Ok":
            if hasattr(response, 'transactionResponse') and response.transactionResponse is not None:
                txnResp = response.transactionResponse
                result["success"] = str(txnResp.responseCode) == "1"
                result["response_code"] = str(txnResp.responseCode)
                result["transaction_id"] = str(txnResp.transId)
                result["auth_code"] = str(txnResp.authCode) if hasattr(txnResp, 'authCode') else None
                result["avs_result"] = str(txnResp.avsResultCode) if hasattr(txnResp, 'avsResultCode') else None
                result["cvv_result"] = str(txnResp.cvvResultCode) if hasattr(txnResp, 'cvvResultCode') else None
                
                if hasattr(txnResp, 'accountNumber'):
                    result["account_number"] = str(txnResp.accountNumber)
                if hasattr(txnResp, 'accountType'):
                    result["account_type"] = str(txnResp.accountType)
                if hasattr(txnResp, 'networkTransId'):
                    result["network_trans_id"] = str(txnResp.networkTransId)
                    
                if hasattr(txnResp, 'messages') and txnResp.messages:
                    result["message"] = str(txnResp.messages.message[0].description)
                
                if hasattr(txnResp, 'errors') and txnResp.errors:
                    result["success"] = False
                    result["error_code"] = str(txnResp.errors.error[0].errorCode)
                    result["error_message"] = str(txnResp.errors.error[0].errorText)
        else:
            if hasattr(response, 'transactionResponse') and response.transactionResponse is not None:
                txnResp = response.transactionResponse
                if hasattr(txnResp, 'errors') and txnResp.errors:
                    result["error_code"] = str(txnResp.errors.error[0].errorCode)
                    result["error_message"] = str(txnResp.errors.error[0].errorText)
            else:
                result["error_code"] = str(response.messages.message[0].code)
                result["error_message"] = str(response.messages.message[0].text)
    else:
        result["error_message"] = "No response from payment gateway"
    
    return result
