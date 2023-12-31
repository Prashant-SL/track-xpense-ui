import { useQuery } from "react-query";
import TransactionButton from "../src/components/transaction/TransactionButton";
import TransactionList from "../src/components/transaction/TransactionList";
import Skeleton from "../src/components/Skeleton";
import * as URLHelpers from "../src/helpers/URLHelpers";
import axios from "axios";
import { Link } from "react-router-dom";
import NoContent from "../src/components/NoContent";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const userToken = localStorage.getItem("token");
  const isLoggedIn = userToken ? true : false;
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      if (!userToken) {
        window.location.href("/login");
      }
    }, 3000);
  }, [userToken]);

  const headers = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchTransactions = async () => {
    const { data } = await axios.get(
      `${URLHelpers.backendURL}/transactions/get-transactions`,
      headers
    );

    return data;
  };

  const { isLoading, data: transactionsList } = useQuery(
    "transactions",
    isLoggedIn && fetchTransactions
  );

  const fetchBalance = async () => {
    const { data } = await axios.get(
      `${URLHelpers.backendURL}/transactions/get-balance`,
      headers
    );
    const { balance, totalIncome, totalExpense } = data;
    return { balance, totalIncome, totalExpense };
  };

  const { data: availableBalance } = useQuery(
    "availableBalance",
    isLoggedIn && fetchBalance
  );

  if (isLoading)
    return (
      <h1>
        Loading...
        <br />
        If you are not logged in, Please login.
      </h1>
    );

  return (
    <div className="mx-auto lg:mb-12 relative w-max text-center min-h-maxM lg:min-h-maxD">
      {isLoading}
      <div className="shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-35px] bg-gradient-to-b from-transparent to-purple-50 sticky z-0 pb-6 rounded-3xl">
        <div className="mt-4 leading-[50px]">
          <p className="text-sm">Available Balance</p>
          <h2 className="text-[40px] text-black font-semibold">{`$ ${availableBalance?.balance}`}</h2>
        </div>
        <div className="flex gap-4 my-4 justify-center">
          <TransactionButton
            pageName="Home"
            lastTrasaction={availableBalance?.lastIncome}
            transactionData={{ type: "income" }}
          />
          <TransactionButton
            pageName="Home"
            lastTrasaction={availableBalance?.lastExpense}
            transactionData={{ type: "expense" }}
          />
        </div>
      </div>

      {/* Recent Transaction's list */}
      <>
        {transactionsList?.length ? (
          <div className="flex my-2 w-max px-4 mt-6 mb-3 justify-between items-center">
            <p className="font-medium">Recent Transactions</p>
            <Link
              to="/get-transactions"
              className="bg-primary-50 text-xs text-purple-800 px-4 py-2 rounded-2xl"
            >
              See All
            </Link>
          </div>
        ) : (
          <NoContent />
        )}
        {isLoading && <Skeleton />}

        {transactionsList?.length <= 4
          ? transactionsList?.map((transactionList) => (
              <TransactionList
                transactionData={transactionList}
                key={transactionList._id}
              />
            ))
          : transactionsList
              ?.slice(0, 4)
              ?.map((transactionList) => (
                <TransactionList
                  transactionData={transactionList}
                  key={transactionList._id}
                />
              ))}
      </>
    </div>
  );
};

export default Dashboard;
