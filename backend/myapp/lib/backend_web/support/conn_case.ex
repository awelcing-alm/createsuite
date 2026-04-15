defmodule BackendWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by controller tests.

  Controller tests do not need the SQL Sandbox (they test HTTP behavior,
  not database operations). Use `Backend.DataCase` directly in context tests
  that require the sandbox.

  Such tests rely on `Phoenix.ConnTest` and also import other functionality
  to make it easier to build common data structures and query the data layer.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # The default endpoint for testing
      @endpoint BackendWeb.Endpoint

      use BackendWeb, :verified_routes

      # Import conveniences for testing with connections
      import Plug.Conn
      import Phoenix.ConnTest
      import BackendWeb.ConnCase
    end
  end

  setup _tags do
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end
end
