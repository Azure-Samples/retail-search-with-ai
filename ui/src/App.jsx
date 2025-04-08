import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Code,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  useToast
} from '@chakra-ui/react';

function App() {
  // Basic states
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [query, setQuery] = useState("");
  const [reasoningEffort, setReasoningEffort] = useState("o3-mini-low");

  // Compare toggles
  const [compare, setCompare] = useState(false);
  // "no-llm" or "gpt4o"
  const [leftModel, setLeftModel] = useState("no-llm");

  // Search results for left & right
  const [searchResultsLeft, setSearchResultsLeft] = useState([]);
  const [searchResultsRight, setSearchResultsRight] = useState([]);

  // Other expansions & metadata
  const [expandedTermsRight, setExpandedTermsRight] = useState([]);
  const [expandedTermsLeft, setExpandedTermsLeft] = useState([]);
  const [filterExpr, setFilterExpr] = useState("");

  // Justifications and recommended counts
  const [justificationLeft, setJustificationLeft] = useState("");
  const [justificationRight, setJustificationRight] = useState("");
  const [numRecommendedLeft, setNumRecommendedLeft] = useState(0);
  const [numRecommendedRight, setNumRecommendedRight] = useState(0);

  const [searchTimeMs, setSearchTimeMs] = useState(0);

  // Customer profile JSON
  const [customerProfile, setCustomerProfile] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // For local dev (or same machine) on port 80
  const port = 80;

  // 1) Fetch list of customers on mount
  useEffect(() => {
    fetch(`http://localhost:${port}/api/customers`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        if (data.length > 0) {
          setSelectedCustomer(data[0]);
        }
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        toast({
          title: "Error",
          description: "Failed to fetch customer profiles",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [toast]);

  // 2) Whenever selectedCustomer changes, fetch that user’s JSON
  useEffect(() => {
    if (!selectedCustomer) return;
    fetch(`http://localhost:${port}/api/customer/${selectedCustomer}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomerProfile(data);
      })
      .catch((err) => {
        console.error("Error fetching customer profile:", err);
        toast({
          title: "Error",
          description: "Failed to fetch customer profile",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [selectedCustomer, toast]);

  // 3) handleSearch calls the server with new fields: compare & leftModel
  const handleSearch = () => {
    if (!query || !selectedCustomer) {
      toast({
        title: "Invalid Input",
        description: "Please enter a query and select a customer profile.",
        status: "warning",
        duration: 5000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);

    fetch(`http://localhost:${port}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        customer: selectedCustomer,
        reasoning_effort: reasoningEffort,
        compare: compare,
        left_model: leftModel,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // The server now returns:
        //   data.search_results_left
        //   data.search_results_right
        //   data.justification_left
        //   data.justification_right
        //   data.num_recommended_left
        //   data.num_recommended_right
        //   data.expanded_terms
        //   data.filter_expr
        //   data.search_time_ms

        setSearchResultsLeft(data.search_results_left || []);
        setSearchResultsRight(data.search_results_right || []);

        setJustificationLeft(data.justification_left || "");
        setJustificationRight(data.justification_right || "");
        setNumRecommendedLeft(data.num_recommended_left || 0);
        setNumRecommendedRight(data.num_recommended_right || 0);

        setExpandedTermsRight(data.expanded_terms_right || []);
        setExpandedTermsLeft(data.expanded_terms_left || []);

        if (typeof data.filter_expr === "object") {
          setFilterExpr(JSON.stringify(data.filter_expr, null, 2));
        } else {
          setFilterExpr(data.filter_expr || "");
        }

        setSearchTimeMs(data.search_time_ms || 0);
        console.log("Search results:", data);
      })
      .catch((err) => {
        console.error("Error fetching search results:", err);
        toast({
          title: "Error",
          description: "Failed to fetch search results",
          status: "error",
          duration: 5000,
          isClosable: true
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Render the search results (compare vs single)
  const renderSearchResults = () => {
    if (!compare) {
      // If compare is OFF, we only display the "right" results (the O1 model).
      return (
        <Box
          bg="white"
          p={6}
          shadow="sm"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading as="h2" size="md" mb={4}>
            Search Results ({reasoningEffort})
          </Heading>

          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" minH="150px">
              <Spinner size="xl" />
            </Flex>
          ) : searchResultsRight && searchResultsRight.length > 0 ? (
            searchResultsRight.map((product, index) => {
              // highlight if index < numRecommendedRight
              const isRecommended = index < numRecommendedRight;
              return (
                <Box
                  key={product.id}
                  bg={isRecommended ? "blue.50" : "white"}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={4}
                  mb={4}
                >
                  <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <Text fontWeight="bold">ID: {product.id}</Text>
                    <Text fontWeight="bold" fontSize="lg" color="blue.500">
                      ${product.price}
                    </Text>
                  </Flex>

                  <Text>
                    <strong>Name:</strong> {product.name}
                  </Text>
                  <Text>
                    <strong>Brand:</strong> {product.brand}
                  </Text>
                  <Text>
                    <strong>Description:</strong> {product.description}
                  </Text>

                  {typeof product.images === "string" && product.images.length > 0 ? (
                    <Box mt={2}>
                      <Image
                        src={product.images}
                        alt={product.name}
                        maxW="150px"
                        borderRadius="md"
                      />
                    </Box>
                  ) : null}
                </Box>
              );
            })
          ) : (
            <Text>No results found.</Text>
          )}
        </Box>
      );
    } else {
      // If compare is ON => side by side
      return (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {/* LEFT results */}
          <Box
            bg="white"
            p={6}
            shadow="sm"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Heading as="h2" size="sm" mb={4}>
              Left Results ({leftModel.toUpperCase()})
            </Heading>
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="150px">
                <Spinner size="xl" />
              </Flex>
            ) : searchResultsLeft && searchResultsLeft.length > 0 ? (
              searchResultsLeft.map((product, index) => {
                // If the left model is "gpt4o", we might highlight recommended items
                // using numRecommendedLeft
                const isRecommendedLeft = index < numRecommendedLeft;
                return (
                  <Box
                    key={product.id}
                    bg={isRecommendedLeft ? "green.50" : "white"}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={4}
                    mb={4}
                  >
                    <Flex justifyContent="space-between" alignItems="center" mb={2}>
                      <Text fontWeight="bold">ID: {product.id}</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.500">
                        ${product.price}
                      </Text>
                    </Flex>

                    <Text>
                      <strong>Name:</strong> {product.name}
                    </Text>
                    <Text>
                      <strong>Brand:</strong> {product.brand}
                    </Text>
                    <Text>
                      <strong>Description:</strong> {product.description}
                    </Text>

                    {typeof product.images === "string" && product.images.length > 0 ? (
                    <Box mt={2}>
                      <Image
                        src={product.images}
                        alt={product.name}
                        maxW="150px"
                        borderRadius="md"
                      />
                    </Box>
                  ) : null}

                  
                  </Box>
                );
              })
            ) : (
              <Text>No results found.</Text>
            )}
          </Box>

          {/* RIGHT results (o1) */}
          <Box
            bg="white"
            p={6}
            shadow="sm"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Heading as="h2" size="sm" mb={4}>
              Right Results ({reasoningEffort})
            </Heading>
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" minH="150px">
                <Spinner size="xl" />
              </Flex>
            ) : searchResultsRight && searchResultsRight.length > 0 ? (
              searchResultsRight.map((product, index) => {
                const isRecommendedRight = index < numRecommendedRight;
                return (
                  <Box
                    key={product.id}
                    bg={isRecommendedRight ? "blue.50" : "white"}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={4}
                    mb={4}
                  >
                    <Flex justifyContent="space-between" alignItems="center" mb={2}>
                      <Text fontWeight="bold">ID: {product.id}</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.500">
                        ${product.price}
                      </Text>
                    </Flex>

                    <Text>
                      <strong>Name:</strong> {product.name}
                    </Text>
                    <Text>
                      <strong>Brand:</strong> {product.brand}
                    </Text>
                    <Text>
                      <strong>Description:</strong> {product.description}
                    </Text>
                    {typeof product.images === "string" && product.images.length > 0 ? (
                    <Box mt={2}>
                      <Image
                        src={product.images}
                        alt={product.name}
                        maxW="150px"
                        borderRadius="md"
                      />
                    </Box>
                  ) : null}

                  </Box>
                );
              })
            ) : (
              <Text>No results found.</Text>
            )}
          </Box>
        </SimpleGrid>
      );
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" p={4}>
        <Heading size="lg" mb={0}>
          E-commerce Search Comparison
        </Heading>
      </Box>

      <Container maxW="8xl" py={8}>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={6}
          templateColumns={{ base: "1fr", md: "3fr 1fr" }}
        >
          {/* LEFT COLUMN: Form + justification + results */}
          <Box>
            {/* Search Form */}
            <Box
              bg="white"
              p={6}
              mb={6}
              shadow="sm"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <Heading as="h2" size="md" mb={4}>
                Search Options
              </Heading>

              <FormControl mb={4}>
                <FormLabel>Query</FormLabel>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. my lawn is dying"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Customer Profile</FormLabel>
                <Select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  {customers.map((cust) => (
                    <option key={cust} value={cust}>
                      {cust}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Model & Reasoning (Right/O1/O3)</FormLabel>
                <Select
                  value={reasoningEffort}
                  onChange={(e) => setReasoningEffort(e.target.value)}
                >
                  <option value="o1-mini">o1-Mini</option>
                  <option value="o1-low">o1 Low</option>
                  <option value="o1-medium">o1 Medium</option>
                  <option value="o1-high">o1 High</option>
                  <option value="o3-mini-low">o3-Mini Low</option>
                  <option value="o3-mini-medium">o3-Mini Medium</option>
                  <option value="o3-mini-high">o3-Mini High</option>
                  <option value="gpt45">GPT-4.5</option>
                </Select>
              </FormControl>

              {/* Compare Toggle */}
              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel mb="0" mr={2}>
                  Compare?
                </FormLabel>
                <Switch
                  isChecked={compare}
                  onChange={(e) => setCompare(e.target.checked)}
                />
              </FormControl>

              {/* Left Model Dropdown */}
              {compare && (
                <FormControl mb={4}>
                  <FormLabel>Left Model</FormLabel>
                  <Select
                    value={leftModel}
                    onChange={(e) => setLeftModel(e.target.value)}
                  >
                    <option value="no-llm">No-LLM</option>
                    <option value="gpt4o">GPT-4o</option>
                    <option value="gpt45">GPT-4.5</option>
                  </Select>
                </FormControl>
              )}

              <Button
                colorScheme="blue"
                onClick={handleSearch}
                isLoading={isLoading}
                loadingText="Searching..."
              >
                Search
              </Button>
            </Box>

            {/* Justification for the Right side (O1) */}
            {justificationRight && (
              <Box
                bg="white"
                p={6}
                mb={6}
                shadow="sm"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <Heading as="h2" size="md" mb={4}>
                  Why These Products? (Right/{reasoningEffort})
                </Heading>
                <Text>{justificationRight}</Text>
              </Box>
            )}

            {/* Justification for the Left side (only if compare is ON & justificationLeft) */}
            {compare && justificationLeft && (
              <Box
                bg="white"
                p={6}
                mb={6}
                shadow="sm"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <Heading as="h2" size="md" mb={4}>
                  Why These Products? (Left/{leftModel})
                </Heading>
                <Text>{justificationLeft}</Text>
              </Box>
            )}            

            {/* Render the search results (compare vs single) */}
            {renderSearchResults()}
          </Box>

          {/* RIGHT COLUMN: Stats + expanded + profile */}
          <Box
            bg="white"
            p={6}
            shadow="sm"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            h="fit-content"
          >
            <Heading as="h3" size="md" mb={4}>
              Expanded Query + Profile
            </Heading>

            {/* Search Stats */}
            <Box mb={6}>
              <Heading as="h4" size="sm" mb={2}>
                Search Stats
              </Heading>
              <Text>
                <strong>Time:</strong> {searchTimeMs} seconds
              </Text>
              {/* Show recommended info for Left and Right */}
              {compare && (
                <Text>
                  <strong>Recommended (Left/{leftModel}):</strong> {numRecommendedLeft} product(s)
                </Text>
              )}
              <Text>
                <strong>Recommended (Right/{reasoningEffort}):</strong> {numRecommendedRight} product(s)
              </Text>
            </Box>

            {/* Expanded Terms */}
            <Box mb={6}>
              <Heading as="h4" size="sm" mb={2}>
                Expanded Terms (Left/{leftModel})
              </Heading>
              {expandedTermsLeft && expandedTermsLeft.length > 0 ? (
                <Box ml={4}>
                  {expandedTermsLeft.map((term, idx) => (
                    <Text key={idx}>&bull; {term}</Text>
                  ))}
                </Box>
              ) : (
                <Text>No expanded terms.</Text>
              )}
            </Box>

            {/* Expanded Terms */}
            <Box mb={6}>
              <Heading as="h4" size="sm" mb={2}>
                Expanded Terms (Right/{reasoningEffort})
              </Heading>
              {expandedTermsRight && expandedTermsRight.length > 0 ? (
                <Box ml={4}>
                  {expandedTermsRight.map((term, idx) => (
                    <Text key={idx}>&bull; {term}</Text>
                  ))}
                </Box>
              ) : (
                <Text>No expanded terms.</Text>
              )}
            </Box>


            {/* Filter Expression */}
            <Box mb={6}>
              <Heading as="h4" size="sm" mb={2}>
                Filter Expression (Right/{reasoningEffort})
              </Heading>
              {filterExpr ? (
                <Code whiteSpace="pre-wrap" p={2} display="block">
                  {filterExpr}
                </Code>
              ) : (
                <Text>No filter expression.</Text>
              )}
            </Box>

            {/* Customer Profile JSON */}
            <Box>
              <Heading as="h4" size="sm" mb={2}>
                Customer Profile
              </Heading>
              {customerProfile ? (
                <Code whiteSpace="pre-wrap" p={2} display="block">
                  {JSON.stringify(customerProfile, null, 2)}
                </Code>
              ) : (
                <Text>No customer profile loaded.</Text>
              )}
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default App;
